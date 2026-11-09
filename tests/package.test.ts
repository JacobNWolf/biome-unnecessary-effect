import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';

const ROOT = join(import.meta.dir, '..');
const BIOME_VERSION: string = JSON.parse(
  readFileSync(join(ROOT, 'node_modules', '@biomejs', 'biome', 'package.json'), 'utf8'),
).version;
const [major = 0, minor = 0] = BIOME_VERSION.split('.').map(Number);

const COMPONENT = [
  "import { useEffect, useState } from 'react';",
  'export function Form({ first }: { first: string }) {',
  "  const [full, setFull] = useState('');",
  '  useEffect(() => {',
  '    setFull(first);',
  '  }, [first]);',
  '  useEffect(() => {',
  '    // biome-ignore lint/plugin/@jacobwolf/biome-unnecessary-effect/noDerivedState: suppression test',
  '    setFull(first + "!");',
  '  }, [first]);',
  '  useEffect(() => {',
  '    const update = setFull;',
  '    update(first);',
  '  }, [first]);',
  '  return full;',
  '}',
].join('\n');

const lintPacked = (preset: string) => {
  const dir = mkdtempSync(join(tmpdir(), 'bue-package-'));
  const pack = Bun.spawnSync(['npm', 'pack', '--silent', '--pack-destination', dir], { cwd: ROOT });
  const tarball = join(dir, pack.stdout.toString().trim());
  const packageDir = join(dir, 'node_modules', '@jacobwolf', 'biome-unnecessary-effect');
  mkdirSync(packageDir, { recursive: true });
  Bun.spawnSync(['tar', '-xzf', tarball, '-C', packageDir, '--strip-components=1']);

  writeFileSync(
    join(dir, 'biome.json'),
    JSON.stringify({ plugins: [`@jacobwolf/biome-unnecessary-effect/presets/${preset}`] }),
  );
  writeFileSync(join(dir, 'component.tsx'), COMPONENT);

  const { stdout } = Bun.spawnSync(
    [join(ROOT, 'node_modules', '.bin', 'biome'), 'lint', '--reporter=json', 'component.tsx'],
    { cwd: dir },
  );
  const text = stdout.toString();
  const { diagnostics } = JSON.parse(text.slice(text.indexOf('{')));
  return diagnostics
    .filter((d: { category: string }) => d.category === 'plugin')
    .map((d: { location: { start: { line: number } } }) => d.location.start.line);
};

describe.skipIf(major === 2 && minor < 6)('published package', () => {
  test('recommended preset loads the GritQL rules', () => {
    expect(lintPacked('recommended')).toEqual([5]);
  });

  // The deep rule has its own suppression name, so line 9 is reported, and it follows the `update` alias on line 13.
  test('deep preset loads the TypeScript rules', () => {
    expect(lintPacked('deep')).toEqual([5, 9, 13]);
  });
});
