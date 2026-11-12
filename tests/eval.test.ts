import { describe, expect, test } from 'bun:test';

import { compareBaseline, presetRule, validateBaseline } from '../scripts/eval-baseline.ts';

const baseline = () => ({
  upstream: '1.2.0',
  caught: {
    recommended: { 'no-derived-state': 18, 'no-event-handler': 8 },
    deep: { 'no-derived-state': 20, 'no-event-handler': 8 },
  },
});

describe('eval baseline validation', () => {
  test('accepts zero counts and the installed upstream version', () => {
    const value = baseline();
    value.caught.recommended['no-event-handler'] = 0;

    expect(validateBaseline(value, '1.2.0')).toEqual(value);
  });

  test('rejects a different upstream version', () => {
    expect(() => validateBaseline(baseline(), '1.3.0')).toThrow('must match upstream v1.3.0');
  });

  test.each([undefined, {}, { recommended: {} }, { recommended: 82, deep: 84 }])(
    'rejects absent or incomplete per-rule baselines: %j',
    (caught) => {
      expect(() => validateBaseline({ upstream: '1.2.0', caught }, '1.2.0')).toThrow();
    },
  );

  test.each([undefined, null, '18', -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects an invalid rule count: %j',
    (count) => {
      const value = baseline();
      const recommended = { ...value.caught.recommended, 'no-derived-state': count };

      expect(() => validateBaseline({ ...value, caught: { ...value.caught, recommended } }, '1.2.0')).toThrow(
        'Invalid baseline for recommended [no-derived-state]',
      );
    },
  );

  test('rejects a rule missing from one preset', () => {
    const value = baseline();

    expect(() =>
      validateBaseline({ ...value, caught: { ...value.caught, deep: { 'no-derived-state': 20 } } }, '1.2.0'),
    ).toThrow('must cover the same upstream rules');
  });
});

test.each([
  ['recommended', 'noDerivedState'],
  ['deep', 'noDerivedStateDeep'],
] as const)('eval only scores rules enabled in the %s preset', (preset, rule) => {
  expect(presetRule(preset, [rule])('no-derived-state')).toBe(rule);
  expect(presetRule(preset, [])('no-derived-state')).toBeUndefined();
});

describe('eval per-rule regressions', () => {
  test('a gain in one rule cannot hide a regression in another', () => {
    const { failures, notes } = compareBaseline(
      'recommended',
      { 'no-derived-state': 17, 'no-event-handler': 9 },
      baseline().caught.recommended,
    );

    expect(failures).toEqual(['recommended [no-derived-state] catches 17, below the baseline of 18.']);
    expect(notes).toHaveLength(1);
    expect(notes[0]).toContain('recommended [no-event-handler] catches 9, above the baseline of 8.');
  });

  test('unchanged counts pass without update notes', () => {
    const counts = baseline().caught.recommended;

    expect(compareBaseline('recommended', counts, counts)).toEqual({ failures: [], notes: [] });
  });

  test.each([
    [{ 'no-derived-state': 18 }, {}],
    [{}, { 'no-derived-state': 18 }],
  ])('rejects a rule missing from extraction or the baseline', (actual, expected) => {
    expect(() => compareBaseline('recommended', actual, expected)).toThrow(
      'Missing extracted cases or baseline for recommended [no-derived-state]',
    );
  });
});
