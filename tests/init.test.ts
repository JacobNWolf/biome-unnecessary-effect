import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';

const INIT = join(import.meta.dir, '..', 'scripts', 'init.js');
const PRESET = '@jacobwolf/biome-unnecessary-effect/presets/recommended';
const LEGACY_ENTRY = 'node_modules/@jacobwolf/biome-unnecessary-effect/grit/react-effects.grit';

const project = (biomeVersion: string | null, config?: { name: string; text: string }) => {
  const dir = mkdtempSync(join(tmpdir(), 'bue-init-'));
  writeFileSync(join(dir, 'package.json'), '{}');
  if (biomeVersion) {
    mkdirSync(join(dir, 'node_modules', '@biomejs', 'biome'), { recursive: true });
    writeFileSync(
      join(dir, 'node_modules', '@biomejs', 'biome', 'package.json'),
      JSON.stringify({ version: biomeVersion }),
    );
  }
  if (config) writeFileSync(join(dir, config.name), config.text);
  return dir;
};

const init = (cwd: string) => {
  const { exitCode, stdout, stderr } = Bun.spawnSync(['node', INIT, 'init'], { cwd });
  return { exitCode, output: stdout.toString() + stderr.toString() };
};

const plugins = (dir: string, name = 'biome.json') => JSON.parse(readFileSync(join(dir, name), 'utf8')).plugins;

describe('init', () => {
  test('adds the preset on Biome 2.6+', () => {
    const dir = project('2.6.6', { name: 'biome.json', text: '{\n  "linter": { "enabled": true }\n}\n' });
    expect(init(dir).exitCode).toBe(0);
    expect(plugins(dir)).toEqual([PRESET]);
  });

  test('adds rule file paths before Biome 2.6', () => {
    const dir = project('2.5.15', { name: 'biome.json', text: '{}' });
    expect(init(dir).exitCode).toBe(0);
    const entries: string[] = plugins(dir);
    expect(entries).toContain('./node_modules/@jacobwolf/biome-unnecessary-effect/grit/rules/noDerivedState.grit');
    expect(entries).not.toContain(
      './node_modules/@jacobwolf/biome-unnecessary-effect/grit/rules/preferUseEffectEvent.grit',
    );
  });

  test('replaces the v0.1 entry, keeps other plugins, and is idempotent', () => {
    const dir = project('2.6.6', {
      name: 'biome.json',
      text: JSON.stringify({ plugins: ['./mine.grit', LEGACY_ENTRY] }),
    });
    expect(init(dir).exitCode).toBe(0);
    expect(init(dir).output).toContain('already configured');
    expect(plugins(dir)).toEqual(['./mine.grit', PRESET]);
  });

  test('creates biome.json when there is no config', () => {
    const dir = project('2.6.6');
    expect(init(dir).exitCode).toBe(0);
    expect(plugins(dir)).toEqual([PRESET]);
  });

  test('leaves JSONC with comments untouched and prints the entries', () => {
    const text = '{\n  // keep me\n  "plugins": []\n}\n';
    const dir = project('2.6.6', { name: 'biome.jsonc', text });
    const { exitCode, output } = init(dir);
    expect(exitCode).toBe(1);
    expect(output).toContain(PRESET);
    expect(readFileSync(join(dir, 'biome.jsonc'), 'utf8')).toBe(text);
  });

  test('rejects missing or unsupported Biome', () => {
    expect(init(project(null)).output).toContain('not installed');
    expect(init(project('2.4.4')).output).toContain('too old');
  });
});
