import { spawnSync } from 'bun';
import { expect, test, describe } from 'vitest';
import { resolve } from 'node:path';

const FIXTURES_PATH = resolve(import.meta.dir, 'fixtures');

function runBiome(filePath: string) {
  const { stdout, stderr, exitCode } = spawnSync(
    [
      'bun',
      'x',
      '@biomejs/biome',
      'lint',
      '--error-on-warnings',
      '--colors=force',
      '--max-diagnostics=none',
      '--no-errors-on-unmatched',
      filePath,
    ],
    {
      cwd: import.meta.dir,
    },
  );

  const output = (stdout ? new TextDecoder().decode(stdout) : '') + (stderr ? new TextDecoder().decode(stderr) : '');

  return {
    stdout: stdout ? new TextDecoder().decode(stdout) : '',
    stderr: stderr ? new TextDecoder().decode(stderr) : '',
    output,
    exitCode,
  };
}

describe('unnecessary-effect plugin', () => {
  test('should detect empty effect', () => {
    const { output, exitCode } = runBiome(resolve(FIXTURES_PATH, 'empty-effect.tsx'));
    expect(exitCode).not.toBe(0);
    expect(output).toContain('This effect is empty and could be removed.');
  });

  test('should detect initializing state', () => {
    const { output, exitCode } = runBiome(resolve(FIXTURES_PATH, 'avoid-initializing-state.tsx'));
    expect(exitCode).not.toBe(0);
    expect(output).toContain('Avoid initializing state in an effect. Instead, pass the initial value to useState.');
  });

  test('should detect derived state', () => {
    const { output, exitCode } = runBiome(resolve(FIXTURES_PATH, 'avoid-derived-or-chained-state.tsx'));
    expect(exitCode).not.toBe(0);
    expect(output).toContain('Avoid storing derived state or chaining state updates.');
  });

  test('should detect parent-child coupling', () => {
    const { output, exitCode } = runBiome(resolve(FIXTURES_PATH, 'avoid-parent-child-coupling.tsx'));
    expect(exitCode).not.toBe(0);
    expect(output).toContain('Avoid coupling parent behavior or state to a child component.');
  });

  test('should detect effect as event handler', () => {
    const { output, exitCode } = runBiome(resolve(FIXTURES_PATH, 'avoid-event-handler.tsx'));
    expect(exitCode).not.toBe(0);
    expect(output).toContain('Avoid using state as an event handler. Instead, call the event handler directly.');
  });

  test('should detect data fetching in effect', () => {
    const { output, exitCode } = runBiome(resolve(FIXTURES_PATH, 'avoid-data-fetching.tsx'));
    expect(exitCode).not.toBe(0);
    expect(output).toContain('Avoid fetching data directly in useEffect. Consider using a data fetching library');
  });

  test('should detect axios data fetching in effect', () => {
    const { output, exitCode } = runBiome(resolve(FIXTURES_PATH, 'avoid-data-fetching-axios.tsx'));
    expect(exitCode).not.toBe(0);
    expect(output).toContain('Avoid fetching data directly in useEffect. Consider using a data fetching library');
  });

  test('should not report valid effects', () => {
    const { exitCode } = runBiome(resolve(FIXTURES_PATH, 'valid-effect.tsx'));
    expect(exitCode).toBe(0);
  });
});
