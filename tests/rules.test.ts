import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';

const ROOT = join(import.meta.dir, '..');
const RULES_DIR = join(ROOT, 'grit', 'rules');
const TS_RULES_DIR = join(ROOT, 'ts', 'rules');
const FIXTURES_DIR = join(import.meta.dir, 'fixtures');
const BIOME_BIN = join(ROOT, 'node_modules', '.bin', 'biome');
const BIOME_VERSION: string = JSON.parse(
  readFileSync(join(ROOT, 'node_modules', '@biomejs', 'biome', 'package.json'), 'utf8'),
).version;

const [major = 0, minor = 0] = BIOME_VERSION.split('.').map(Number);
const SUPPORTS_TS_PLUGINS = major > 2 || (major === 2 && minor >= 6);

const rules = [
  ...readdirSync(RULES_DIR)
    .filter((file) => file.endsWith('.grit'))
    .map((file) => ({ name: file.slice(0, -'.grit'.length), path: join(RULES_DIR, file) })),
  ...(SUPPORTS_TS_PLUGINS ? readdirSync(TS_RULES_DIR) : [])
    .filter((file) => file.endsWith('.ts'))
    .map((file) => ({ name: file.slice(0, -'.ts'.length), path: join(TS_RULES_DIR, file) })),
];

// Fixtures mark each line a rule must report with a trailing `// expect: ruleA, ruleB` (or `{/* expect: rule */}` in JSX).
const fixtures = readdirSync(FIXTURES_DIR, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.[cm]?[jt]sx?$/.test(file))
  .map((file) => ({ file, lines: readFileSync(join(FIXTURES_DIR, file), 'utf8').split('\n') }));

const expected = (rule: string) =>
  fixtures
    .flatMap(({ file, lines }) =>
      lines.flatMap((line, i) => {
        const names =
          line
            .match(/(?:\/\/|\/\*) expect: ([\w, ]+)/)?.[1]
            ?.split(',')
            .map((name) => name.trim()) ?? [];
        return names.includes(rule) ? [`${file}:${i + 1}`] : [];
      }),
    )
    .sort();

type Diagnostic = { category: string; message: string; location: { path: string; start: { line: number } } };

const lint = (rulePath: string) => {
  const configDir = mkdtempSync(join(tmpdir(), 'bue-rule-'));
  writeFileSync(join(configDir, 'biome.json'), JSON.stringify({ plugins: [rulePath] }));
  const { stdout, stderr } = Bun.spawnSync(
    [
      BIOME_BIN,
      'lint',
      '--reporter=json',
      '--max-diagnostics=none',
      `--config-path=${configDir}`,
      ...fixtures.map(({ file }) => file),
    ],
    { cwd: FIXTURES_DIR },
  );
  const text = stdout.toString();

  if (!text.trim()) {
    throw new Error(`Biome produced no output for ${rulePath}.\nstderr: ${stderr.toString()}`);
  }

  const report: { diagnostics: Diagnostic[] } = JSON.parse(text.slice(text.indexOf('{')));

  // A plugin that fails to load is reported as a non-plugin diagnostic and would otherwise look like "no reports".
  const loadErrors = report.diagnostics.filter((d) => d.message.includes('during loading of plugins'));
  expect(loadErrors).toEqual([]);

  return report.diagnostics.filter((d) => d.category === 'plugin');
};

describe(`rules (Biome ${BIOME_VERSION})`, () => {
  for (const rule of rules) {
    test(rule.name, () => {
      const diagnostics = lint(rule.path);
      const actual = diagnostics.map(({ location }) => `${location.path}:${location.start.line}`).sort();
      expect(actual).toEqual(expected(rule.name));

      // An unbound metavariable leaks into the message as literal `$name` text.
      for (const { message } of diagnostics) expect(message).not.toMatch(/\$[a-z_]/i);
    });
  }
});
