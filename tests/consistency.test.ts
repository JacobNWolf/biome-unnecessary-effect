import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'bun:test';

const ROOT = join(import.meta.dir, '..');
const RULES_DIR = join(ROOT, 'grit', 'rules');
const gritRules = readdirSync(RULES_DIR)
  .filter((file) => file.endsWith('.grit'))
  .map((file) => file.slice(0, -'.grit'.length));
const tsRules = readdirSync(join(ROOT, 'ts', 'rules'))
  .filter((file) => file.endsWith('.ts'))
  .map((file) => file.slice(0, -'.ts'.length));
const rules = [...gritRules, ...tsRules].sort();

test('every rule file carries the current prelude', () => {
  const prelude = readFileSync(join(ROOT, 'grit', 'prelude.grit'), 'utf8').trim();
  for (const rule of gritRules) {
    expect(readFileSync(join(RULES_DIR, `${rule}.grit`), 'utf8'), `${rule}: run \`bun run sync:prelude\``).toContain(
      prelude,
    );
  }
});

test('the manifest lists every rule exactly once and every preset rule exists', () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'biome-manifest.json'), 'utf8'));
  const declared = manifest.plugins.rules.flatMap((entry: Record<string, string>) => Object.entries(entry));
  expect(declared.map(([name]: [string]) => name).sort()).toEqual(rules);
  for (const [name, path] of declared) {
    expect(path).toBe(tsRules.includes(name) ? `./ts/rules/${name}.ts` : `./grit/rules/${name}.grit`);
  }

  const presetRules: string[] = Object.values<string[]>(manifest.plugins.presets).flat();
  expect([...new Set(presetRules)].sort()).toEqual(rules);
});

test('the deep preset is recommended with each deep rule replacing its GritQL counterpart', () => {
  const { recommended, deep } = JSON.parse(readFileSync(join(ROOT, 'biome-manifest.json'), 'utf8')).plugins.presets;
  const replaced = tsRules.map((rule) => rule.replace(/Deep$/, ''));
  expect([...deep].sort()).toEqual(
    [...recommended.filter((rule: string) => !replaced.includes(rule)), ...tsRules].sort(),
  );
});
