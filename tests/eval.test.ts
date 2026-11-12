import { describe, expect, test } from 'bun:test';

import { compareBaseline, compareFlagged, presetRule, validateBaseline } from '../scripts/eval-baseline.ts';

const baseline = () => ({
  flagged: { recommended: { 'no-derived-state': { 'Case A': 'reason' } }, deep: {} },
  upstream: '1.2.0',
  upstreamCommit: 'ff0e4a0d8a9acf4a08b4f24f32417eb16dfb3f5d',
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
      expect(() => validateBaseline({ ...baseline(), caught }, '1.2.0')).toThrow();
    },
  );

  test.each([undefined, 'v1.2.0', 'ff0e4a0', 'FF0E4A0D8A9ACF4A08B4F24F32417EB16DFB3F5D'])(
    'rejects a missing or non-SHA upstream commit: %j',
    (upstreamCommit) => {
      expect(() => validateBaseline({ ...baseline(), upstreamCommit }, '1.2.0')).toThrow('full commit SHA');
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

describe('eval accepted flags', () => {
  test.each([undefined, null, {}, { recommended: {} }, { recommended: [], deep: {} }])(
    'rejects malformed flags: %j',
    (flagged) => {
      expect(() => validateBaseline({ ...baseline(), flagged }, '1.2.0')).toThrow('Missing accepted flags');
    },
  );
  test.each([[undefined], [null], [[]], ['reason']])('rejects malformed reason maps: %j', (reasons) => {
    expect(() =>
      validateBaseline({ ...baseline(), flagged: { recommended: { 'no-derived-state': reasons }, deep: {} } }, '1.2.0'),
    ).toThrow('needs a reason');
  });
  test.each([undefined, '', '  ', 1])('rejects bad reasons: %j', (reason) => {
    expect(() =>
      validateBaseline(
        { ...baseline(), flagged: { recommended: { 'no-derived-state': { 'Case A': reason } }, deep: {} } },
        '1.2.0',
      ),
    ).toThrow('needs a reason');
  });
  test('rejects unknown rules', () => {
    expect(() =>
      validateBaseline({ ...baseline(), flagged: { recommended: { unknown: {} }, deep: {} } }, '1.2.0'),
    ).toThrow('Unknown rule');
  });
  test('accepts listed flags', () => {
    expect(compareFlagged('recommended', { 'no-derived-state': ['Case A'] }, baseline().flagged.recommended)).toEqual(
      [],
    );
  });
  test('rejects unlisted flags', () => {
    expect(compareFlagged('deep', { rule: ['Case A'] }, {})).toEqual(['deep [rule] flags valid case "Case A".']);
  });
  test('rejects stale flags', () => {
    expect(compareFlagged('deep', {}, { rule: { 'Case A': 'reason' } })).toEqual([
      'deep [rule] no longer flags "Case A". Remove it from flagged in scripts/eval-baseline.json.',
    ]);
  });
  test('keeps identical names under different rules separate', () => {
    expect(compareFlagged('deep', { other: ['Case A'] }, { rule: { 'Case A': 'reason' } })).toEqual([
      'deep [other] flags valid case "Case A".',
      'deep [rule] no longer flags "Case A". Remove it from flagged in scripts/eval-baseline.json.',
    ]);
  });
});
