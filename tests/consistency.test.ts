import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'bun:test';

const ROOT = join(import.meta.dir, '..');
const RULES_DIR = join(ROOT, 'grit', 'rules');
const rules = readdirSync(RULES_DIR)
  .filter((file) => file.endsWith('.grit'))
  .map((file) => file.slice(0, -'.grit'.length))
  .sort();

test('every rule file carries the current prelude', () => {
  const prelude = readFileSync(join(ROOT, 'grit', 'prelude.grit'), 'utf8').trim();
  for (const rule of rules) {
    expect(readFileSync(join(RULES_DIR, `${rule}.grit`), 'utf8'), `${rule}: run \`bun run sync:prelude\``).toContain(
      prelude,
    );
  }
});

test('the manifest lists every rule exactly once and every preset rule exists', () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'biome-manifest.json'), 'utf8'));
  const declared = manifest.plugins.rules.flatMap((entry: Record<string, string>) => Object.entries(entry));
  expect(declared.map(([name]: [string]) => name).sort()).toEqual(rules);
  for (const [name, path] of declared) expect(path).toBe(`./grit/rules/${name}.grit`);

  const presetRules: string[] = Object.values<string[]>(manifest.plugins.presets).flat();
  expect([...new Set(presetRules)].sort()).toEqual(rules);
});
