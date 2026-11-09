import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';

const ROOT = join(import.meta.dir, '..');
const RULES_DIR = join(ROOT, 'grit', 'rules');
const FIXTURES_DIR = join(import.meta.dir, 'fixtures');
const BIOME_BIN = join(ROOT, 'node_modules', '.bin', 'biome');
const BIOME_VERSION: string = JSON.parse(
  readFileSync(join(ROOT, 'node_modules', '@biomejs', 'biome', 'package.json'), 'utf8'),
).version;

const rules = readdirSync(RULES_DIR)
  .filter((file) => file.endsWith('.grit'))
  .map((file) => file.slice(0, -'.grit'.length));

// Fixtures mark each line a rule must report with a trailing `// expect: ruleA, ruleB` (or `{/* expect: rule */}` in JSX).
const fixtures = readdirSync(FIXTURES_DIR, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.[cm]?[jt]sx?$/.test(file))
  .map((file) => ({ file, lines: readFileSync(join(FIXTURES_DIR, file), 'utf8').split('\n') }));

/**
 * Lists the `file:line` fixture locations that declare an expectation for the given rule.
 */
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

/**
 * Lints every fixture with only the given rule enabled and returns the plugin diagnostics.
 */
const lint = (rule: string) => {
  const configDir = mkdtempSync(join(tmpdir(), `bue-${rule}-`));
  writeFileSync(join(configDir, 'biome.json'), JSON.stringify({ plugins: [join(RULES_DIR, `${rule}.grit`)] }));
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
    throw new Error(`Biome produced no output for ${rule}.\nstderr: ${stderr.toString()}`);
  }

  const report: { diagnostics: Diagnostic[] } = JSON.parse(text.slice(text.indexOf('{')));
  return report.diagnostics.filter((d) => d.category === 'plugin');
};

describe(`rules (Biome ${BIOME_VERSION})`, () => {
  for (const rule of rules) {
    test(rule, () => {
      const diagnostics = lint(rule);
      const actual = diagnostics.map(({ location }) => `${location.path}:${location.start.line}`).sort();
      expect(actual).toEqual(expected(rule));

      // An unbound metavariable leaks into the message as literal `$name` text.
      for (const { message } of diagnostics) expect(message).not.toMatch(/\$[a-z_]/i);
    });
  }
});
