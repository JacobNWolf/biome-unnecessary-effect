import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'bun:test';

const ROOT = join(import.meta.dir, '..');
const BIOME_VERSION: string = JSON.parse(
  readFileSync(join(ROOT, 'node_modules', '@biomejs', 'biome', 'package.json'), 'utf8'),
).version;
const [major = 0, minor = 0] = BIOME_VERSION.split('.').map(Number);

// Installs the packed tarball the way a consumer would and lints through the published manifest.
test.skipIf(major === 2 && minor < 6)('published package works through the Biome manifest', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bue-package-'));
  const pack = Bun.spawnSync(['npm', 'pack', '--silent', '--pack-destination', dir], { cwd: ROOT });
  const tarball = join(dir, pack.stdout.toString().trim());
  const packageDir = join(dir, 'node_modules', '@jacobwolf', 'biome-unnecessary-effect');
  mkdirSync(packageDir, { recursive: true });
  Bun.spawnSync(['tar', '-xzf', tarball, '-C', packageDir, '--strip-components=1']);

  writeFileSync(
    join(dir, 'biome.json'),
    JSON.stringify({ plugins: ['@jacobwolf/biome-unnecessary-effect/presets/recommended'] }),
  );
  writeFileSync(
    join(dir, 'component.tsx'),
    [
      "import { useEffect, useState } from 'react';",
      'export function Form({ first }: { first: string }) {',
      "  const [derived, setDerived] = useState('');",
      '  useEffect(() => {',
      '    setDerived(first);',
      '  }, [first]);',
      '  useEffect(() => {',
      '    // biome-ignore lint/plugin/@jacobwolf/biome-unnecessary-effect/noDerivedState: suppression test',
      '    setDerived(first + "!");',
      '  }, [first]);',
      '  return derived;',
      '}',
    ].join('\n'),
  );

  const { stdout } = Bun.spawnSync(
    [join(ROOT, 'node_modules', '.bin', 'biome'), 'lint', '--reporter=json', 'component.tsx'],
    { cwd: dir },
  );
  const text = stdout.toString();
  const { diagnostics } = JSON.parse(text.slice(text.indexOf('{')));
  const lines = diagnostics
    .filter((d: { category: string }) => d.category === 'plugin')
    .map((d: { location: { start: { line: number } } }) => d.location.start.line);
  expect(lines).toEqual([5]);
});
