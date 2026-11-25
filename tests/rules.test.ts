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
  test('all-state reset checks stay bounded with many state declarations', () => {
    const work = mkdtempSync(join(tmpdir(), 'bue-many-states-'));
    writeFileSync(
      join(work, 'biome.json'),
      JSON.stringify({
        plugins: [join(RULES_DIR, 'noResetAllStateOnPropChange.grit')],
      }),
    );
    const declarations = Array.from(
      { length: 64 },
      (_, index) => `const [value${index}, setValue${index}] = useState(0);`,
    ).join('\n');
    writeFileSync(
      join(work, 'case.tsx'),
      `
      function ManyFields({ id }) {
        ${declarations}
        useEffect(() => { setValue0(0); }, [id]);
        return value0;
      }
    `,
    );
    const result = Bun.spawnSync([BIOME_BIN, 'lint', '--reporter=json', '--config-path', work, 'case.tsx'], {
      cwd: work,
      timeout: 10_000,
    });
    expect(result.exitedDueToTimeout).toBe(false);
    const text = result.stdout.toString();
    const report: { diagnostics: Diagnostic[] } = JSON.parse(text.slice(text.indexOf('{')));
    expect(report.diagnostics.filter((d) => d.message.includes('during loading of plugins'))).toEqual([]);
    expect(report.diagnostics.filter((d) => d.category === 'plugin')).toEqual([]);
  }, 15_000);

  for (const rule of rules) {
    test(rule.name, () => {
      const diagnostics = lint(rule.path);
      const actual = diagnostics.map(({ location }) => `${location.path}:${location.start.line}`).sort();
      expect(actual).toEqual(expected(rule.name));

      // An unbound metavariable leaks into the message as literal `$name` text.
      for (const { message } of diagnostics) expect(message).not.toMatch(/\$[a-z_]/i);
      if (rule.name === 'noAdjustStateOnPropChange') {
        const adjustment = diagnostics.find(({ location }) => location.path.endsWith('triggerBindings.tsx'));
        expect(adjustment?.message).toContain('when "isOpen" changes');
        const memberCollision = diagnostics.find(
          ({ location }) =>
            location.path.endsWith('noAdjustStateOnPropChange/preludePrecision.tsx') && location.start.line === 10,
        );
        expect(memberCollision?.message).toContain('when "currentPage" changes');
        expect(memberCollision?.message).not.toContain('when "title" changes');
      }
      if (rule.name === 'noChainStateUpdates') {
        const chain = diagnostics.find(
          ({ location }) => location.path.endsWith('selfDependent.tsx') && location.start.line === 33,
        );
        expect(chain?.message).toContain('changes "other"');
      }
      if (rule.name === 'noResetAllStateOnPropChange') {
        const generic = diagnostics.find(({ location }) => location.path.endsWith('keyAdvice.tsx'));
        expect(generic?.message).toContain('a key that identifies the item');
        expect(generic?.message).not.toContain('key={data}');
        expect(diagnostics.some(({ message }) => message.includes('key={userId}'))).toBe(true);
        const modalAt = (line: number) =>
          diagnostics.find(
            ({ location }) => location.path.endsWith('modalOpenAdvice.tsx') && location.start.line === line,
          )?.message;
        expect(modalAt(12)).toContain('when "isOpen" changes');
        expect(modalAt(12)).toContain('{isOpen && <Form />}');
        expect(modalAt(12)).toContain('preserving-and-resetting-state');
        expect(modalAt(12)).not.toContain('key={');
        expect(modalAt(34)).toContain('when "open" changes');
        expect(modalAt(34)).toContain('{open && <Form />}');
        expect(modalAt(34)).toContain('key={itemId}');
        expect(modalAt(45)).toContain('when "isModalOpen" changes');
        expect(modalAt(45)).toContain('{isModalOpen && <Form />}');
        expect(modalAt(45)).toContain('key={userId}');
        expect(modalAt(58)).toContain('when "props.isOpen" changes');
        expect(modalAt(58)).toContain('{props.isOpen && <Form />}');
        expect(modalAt(69)).toContain('when "visible" changes');
        expect(modalAt(83)).toContain('when "isVisible" changes');
        expect(modalAt(94)).toContain('when "show" changes');
        expect(modalAt(105)).toContain('when "isShown" changes');
        expect(modalAt(116)).toContain('when "opened" changes');
        expect(modalAt(127)).toContain('key={userId}');
        expect(modalAt(127)).not.toContain('when "isOpen" changes');
        expect(modalAt(140)).toContain('key={tabId}');
        expect(modalAt(140)).not.toContain('when "isActive" changes');
      }
      if (rule.name === 'noInitializeState') {
        const hydration = diagnostics.find(
          ({ location }) => location.path.endsWith('hydration.tsx') && location.start.line === 6,
        );
        expect(hydration?.message).toContain('useSyncExternalStore');
        expect(hydration?.message).not.toContain('Pass this value');
        const ordinary = diagnostics.find(
          ({ location }) => location.path.endsWith('hydration.tsx') && location.start.line === 14,
        );
        expect(ordinary?.message).toContain('Pass this value');
      }
    });
  }
});
