import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, normalize } from 'node:path';
import { mapValues, partition } from 'es-toolkit';

import { compareBaseline, PRESETS, type Preset, presetRule, validateBaseline } from './eval-baseline.ts';

const CaseKind = {
  Valid: 'valid',
  Invalid: 'invalid',
} as const;

type CaseKind = (typeof CaseKind)[keyof typeof CaseKind];
type Case = { rule: string; kind: CaseKind; name?: string; code: string; file: string };
type Test = string | { name?: string; code: string };
type Tests = Record<CaseKind, Test[]>;
type Manifest = { plugins: { rules: Record<string, string>[]; presets: Record<Preset, string[]> } };

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

const ROOT = join(import.meta.dir, '..');
const BIN = join(ROOT, 'node_modules', '.bin');
const BASELINE_PATH = join(import.meta.dir, 'eval-baseline.json');

const UPSTREAM = 'eslint-plugin-react-you-might-not-need-an-effect';
const UPSTREAM_DIR = join(ROOT, 'node_modules', UPSTREAM);
const UPSTREAM_REPO = `https://github.com/NickvanDyke/${UPSTREAM}.git`;
const UPSTREAM_VERSION: string = readJson(join(UPSTREAM_DIR, 'package.json')).version;

const baseline = validateBaseline(readJson(BASELINE_PATH), UPSTREAM_VERSION);
const manifest: Manifest = readJson(join(ROOT, 'biome-manifest.json'));
const work = mkdtempSync(join(tmpdir(), 'bue-eval-'));

const COMMAND_TIMEOUT_MS = 120_000;

const run = (cmd: string[]) => {
  const { stdout, stderr, exitCode, exitedDueToTimeout } = Bun.spawnSync(cmd, {
    cwd: work,
    timeout: COMMAND_TIMEOUT_MS,
  });

  if (exitedDueToTimeout) throw new Error(`Timed out after ${COMMAND_TIMEOUT_MS / 1000}s: ${cmd.join(' ')}`);

  return { stdout: stdout.toString(), stderr: stderr.toString(), exitCode };
};

const hit = (file: string, rule: string) => `${normalize(file)} ${rule}`;

const cloneUpstream = (): string => {
  const dir = join(work, 'upstream');
  const tag = `v${UPSTREAM_VERSION}`;

  const { exitCode, stderr } = run(['git', 'clone', '--quiet', '--depth=1', `--branch=${tag}`, UPSTREAM_REPO, dir]);

  if (exitCode !== 0) throw new Error(`Couldn't clone ${UPSTREAM} ${tag}.\n${stderr}`);

  // Tags are mutable, so only run test files from the commit the baseline was reviewed against.
  const head = run(['git', '-C', dir, 'rev-parse', 'HEAD']).stdout.trim();

  if (head !== baseline.upstreamCommit) {
    throw new Error(`${UPSTREAM} ${tag} is ${head || 'unknown'}, expected ${baseline.upstreamCommit}.`);
  }

  return join(dir, 'src', 'rules');
};

const stubImports = (source: string, file: string) =>
  source.replace(/^import\s+(.+?)\s+from\s+["']([^"']+)["'];?$/gm, (_, binding: string, specifier: string) => {
    if (specifier === 'eslint') return `const ${binding} = globalThis.__stubs.eslint;`;
    if (specifier.endsWith('.ts')) return `const ${binding} = globalThis.__stubs.module;`;

    throw new Error(`${file} imports ${specifier}, which the eval doesn't stub`);
  });

const extractCases = async (rulesDir: string): Promise<Case[]> => {
  const cases: Case[] = [];

  class RuleTester {
    run(rule: string, _implementation: unknown, tests: Tests) {
      for (const kind of Object.values(CaseKind)) {
        for (const test of tests[kind]) {
          const { name, code } = typeof test === 'string' ? { name: undefined, code: test } : test;
          const file = `cases/${String(cases.length).padStart(3, '0')}.jsx`;

          cases.push({ rule, kind, name, code, file });
        }
      }
    }
  }

  Object.assign(globalThis, { __stubs: { eslint: { RuleTester }, module: { configs: { recommended: {} } } } });

  const testFiles = readdirSync(rulesDir)
    .filter((name) => name.endsWith('.test.js'))
    .sort();

  for (const file of testFiles) {
    const stubbed = join(rulesDir, `${file}.stubbed.mjs`);
    writeFileSync(stubbed, stubImports(readFileSync(join(rulesDir, file), 'utf8'), file));

    await import(stubbed);
  }

  return cases;
};

const writeCases = (cases: Case[]) => {
  mkdirSync(join(work, 'cases'));

  for (const c of cases) writeFileSync(join(work, c.file), c.code);
};

const lintUpstream = (rules: string[]): Set<string> => {
  const prefix = 'react-you-might-not-need-an-effect';
  const configPath = join(work, '.oxlintrc.json');

  const config = {
    jsPlugins: [join(UPSTREAM_DIR, 'dist', 'index.mjs')],
    categories: { correctness: 'off' },
    rules: Object.fromEntries(rules.map((rule) => [`${prefix}/${rule}`, 'warn'])),
  };
  writeFileSync(configPath, JSON.stringify(config));

  const { stdout, stderr } = run([join(BIN, 'oxlint'), '-c', configPath, '-f', 'json', 'cases']);

  if (!stdout.trim()) throw new Error(`Oxlint produced no output.\n${stderr}`);

  type Diagnostic = { code: string; message: string; filename: string };

  const { diagnostics }: { diagnostics: Diagnostic[] } = JSON.parse(stdout);

  return new Set(
    diagnostics.map((d) => {
      const rule = d.code.match(new RegExp(`^${prefix}\\((.+)\\)$`))?.[1];

      if (!rule) throw new Error(`Unexpected Oxlint diagnostic: ${d.code} ${d.message}`);

      return hit(d.filename, rule);
    }),
  );
};

const lintOurs = (): Set<string> => {
  const rules = manifest.plugins.rules.flatMap((rule) => Object.entries(rule));
  const configDir = join(work, 'biome');
  mkdirSync(configDir);

  const hits = new Set<string>();

  for (const [name, path] of rules) {
    const config = { linter: { rules: { preset: 'none' } }, plugins: [join(ROOT, path)] };
    writeFileSync(join(configDir, 'biome.json'), JSON.stringify(config));

    const args = ['lint', '--reporter=json', '--max-diagnostics=none', `--config-path=${configDir}`, 'cases'];
    const { stdout, stderr } = run([join(BIN, 'biome'), ...args]);

    if (!stdout.trim()) throw new Error(`Biome produced no output for ${name}.\n${stderr}`);

    type Diagnostic = { category: string; message: string; location: { path: string } };

    const { diagnostics }: { diagnostics: Diagnostic[] } = JSON.parse(stdout.slice(stdout.indexOf('{')));

    const unexpected = diagnostics.find((d) => d.category !== 'plugin');
    if (unexpected) throw new Error(`${name}: ${unexpected.category} ${unexpected.message}`);

    for (const d of diagnostics) hits.add(hit(d.location.path, name));
  }

  return hits;
};

const count = (cases: Case[], reported: (c: Case) => boolean) => {
  const [invalid, valid] = partition(cases, (c) => c.kind === CaseKind.Invalid);

  return {
    invalid: invalid.length,
    caught: invalid.filter(reported).length,
    valid: valid.length,
    flagged: valid.filter(reported).length,
  };
};

const score = (cases: Case[], hits: Set<string>, ruleFor: (upstreamRule: string) => string | undefined) => {
  const reported = (c: Case) => {
    const rule = ruleFor(c.rule);

    return rule !== undefined && hits.has(hit(c.file, rule));
  };

  const byRule = Object.groupBy(cases, (c) => c.rule);

  const total = count(cases, reported);
  const rows = mapValues(byRule, (group) => count(group ?? [], reported));

  const wrong = cases.filter((c) => reported(c) !== (c.kind === CaseKind.Invalid));
  const misses = wrong.map(
    (c) => `${c.kind === CaseKind.Invalid ? 'missed' : 'false positive'}: [${c.rule}] ${c.name ?? c.file}`,
  );

  return { rows, total, misses };
};

try {
  const cases = await extractCases(cloneUpstream());
  writeCases(cases);

  const upstreamRules = [...new Set(cases.map((c) => c.rule))];
  const upstream = score(cases, lintUpstream(upstreamRules), (rule) => rule);

  if (upstream.misses.length) {
    throw new Error(`${UPSTREAM} fails its own cases, so extraction is broken:\n${upstream.misses.join('\n')}`);
  }

  const ours = lintOurs();
  const failures: string[] = [];
  const notes: string[] = [];

  console.log(
    `${UPSTREAM} v${UPSTREAM_VERSION}: ${upstream.total.invalid} invalid and ${upstream.total.valid} valid cases`,
  );

  for (const preset of Object.keys(PRESETS) as Preset[]) {
    const { rows, total, misses } = score(cases, ours, presetRule(preset, manifest.plugins.presets[preset]));

    const comparison = compareBaseline(
      preset,
      mapValues(rows, (counts) => counts.caught),
      baseline.caught[preset],
    );

    failures.push(...comparison.failures);
    notes.push(...comparison.notes);

    console.log(
      `\n${preset}: caught ${total.caught}/${total.invalid} invalid, flagged ${total.flagged}/${total.valid} valid`,
    );
    console.table({ ...rows, TOTAL: total });

    for (const miss of misses) console.log(`  ${miss}`);

    if (total.flagged) failures.push(`${preset} flags ${total.flagged} valid case(s).`);
  }

  for (const note of notes) console.log(`\n${note}`);

  if (failures.length) {
    console.error(`\n${failures.join('\n')}`);
    process.exitCode = 1;
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
