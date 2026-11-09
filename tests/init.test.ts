import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
    mkdirSync(join(dir, 'node_modules', '@jacobwolf', 'biome-unnecessary-effect'), { recursive: true });
    mkdirSync(join(dir, 'node_modules', '@biomejs', 'biome'), { recursive: true });
    writeFileSync(
      join(dir, 'node_modules', '@biomejs', 'biome', 'package.json'),
      JSON.stringify({ version: biomeVersion }),
    );
  }
  if (config) writeFileSync(join(dir, config.name), config.text);
  return dir;
};

const init = (cwd: string, ...flags: string[]) => {
  const { exitCode, stdout, stderr } = Bun.spawnSync(['node', INIT, 'init', ...flags], { cwd });
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

  test('preserves user-owned paths containing the package name', () => {
    const unrelated = [
      './custom/@jacobwolf/biome-unnecessary-effect/rule.grit',
      './node_modules/@jacobwolf/biome-unnecessary-effect-custom/rule.grit',
      `${PRESET}-custom`,
      { path: './custom/@jacobwolf/biome-unnecessary-effect/rule.grit' },
    ];
    const dir = project('2.6.6', {
      name: 'biome.json',
      text: JSON.stringify({
        plugins: [
          ...unrelated,
          LEGACY_ENTRY,
          { path: `../../${LEGACY_ENTRY}` },
          { path: LEGACY_ENTRY.replaceAll('/', '\\') },
          PRESET,
        ],
      }),
    });
    expect(init(dir).exitCode).toBe(0);
    expect(plugins(dir)).toEqual([...unrelated, PRESET]);
  });

  test.each(['2.4.5', '2.5.15'])('finds hoisted rule paths on Biome %s', (version) => {
    const root = project(version);
    const dir = join(root, 'packages', 'app');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'package.json'), '{}');
    writeFileSync(join(dir, 'biome.jsonc'), '{}');
    expect(init(dir).exitCode).toBe(0);
    expect(plugins(dir, 'biome.jsonc')).toContain(
      './../../node_modules/@jacobwolf/biome-unnecessary-effect/grit/rules/noDerivedState.grit',
    );
    expect(init(dir).output).toContain('already configured');
  });

  test('leaves the config untouched when the legacy rule package is missing', () => {
    const text = '{ "plugins": ["./mine.grit"] }\n';
    const dir = project('2.5.15', { name: 'biome.json', text });
    rmSync(join(dir, 'node_modules', '@jacobwolf', 'biome-unnecessary-effect'), { recursive: true });
    const { exitCode, output } = init(dir);
    expect(exitCode).toBe(1);
    expect(output).toContain('@jacobwolf/biome-unnecessary-effect is not installed');
    expect(readFileSync(join(dir, 'biome.json'), 'utf8')).toBe(text);
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

test('switches to the deep preset with --deep on Biome 2.6+', () => {
  const dir = project('2.6.6', { name: 'biome.json', text: JSON.stringify({ plugins: [PRESET] }) });

  expect(init(dir, '--deep').exitCode).toBe(0);
  expect(plugins(dir)).toEqual(['@jacobwolf/biome-unnecessary-effect/presets/deep']);

  expect(init(dir).exitCode).toBe(0);
  expect(plugins(dir)).toEqual([PRESET]);

  expect(init(project('2.5.15'), '--deep').output).toContain('needs Biome 2.6.0');
});
