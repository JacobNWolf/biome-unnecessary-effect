import { camelCase, difference, isPlainObject, union } from 'es-toolkit';

export const PRESETS = {
  recommended: camelCase,
  deep: (rule: string) => (rule === 'no-derived-state' ? 'noDerivedStateDeep' : camelCase(rule)),
} as const;

export type Preset = keyof typeof PRESETS;
type Baseline = {
  upstream: string;
  upstreamCommit: string;
  caught: Record<Preset, Record<string, number>>;
  flagged: Record<Preset, Record<string, Record<string, string>>>;
};

export const validateBaseline = (value: unknown, version: string): Baseline => {
  const baseline = value as Baseline | null | undefined;

  if (baseline?.upstream !== version) {
    throw new Error(
      `The eval baseline must match upstream v${version}. Update scripts/eval-baseline.json and the README.`,
    );
  }

  if (typeof baseline.upstreamCommit !== 'string' || !/^[0-9a-f]{40}$/.test(baseline.upstreamCommit)) {
    throw new Error(`The eval baseline needs the full commit SHA of upstream v${version} as upstreamCommit.`);
  }

  for (const preset of Object.keys(PRESETS) as Preset[]) {
    const counts = baseline.caught?.[preset];

    if (!isPlainObject(counts) || !Object.keys(counts).length) {
      throw new Error(`Missing per-rule baseline for ${preset}.`);
    }

    for (const [rule, count] of Object.entries(counts)) {
      if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) {
        throw new Error(`Invalid baseline for ${preset} [${rule}]: expected a non-negative integer.`);
      }
    }

    const flags = baseline.flagged?.[preset];
    if (!isPlainObject(flags)) throw new Error(`Missing accepted flags for ${preset}.`);
    for (const [rule, reasons] of Object.entries(flags)) {
      if (!Object.hasOwn(counts, rule)) throw new Error(`Unknown rule in flagged ${preset} [${rule}].`);
      if (!isPlainObject(reasons)) throw new Error(`${preset} [${rule}] needs a reason.`);
      for (const [name, reason] of Object.entries(reasons)) {
        if (typeof reason !== 'string' || !reason.trim())
          throw new Error(`${preset} [${rule}] "${name}" needs a reason.`);
      }
    }
  }

  const rules = Object.keys(baseline.caught.recommended);

  if (
    rules.length !== Object.keys(baseline.caught.deep).length ||
    rules.some((rule) => !Object.hasOwn(baseline.caught.deep, rule))
  ) {
    throw new Error('The preset baselines must cover the same upstream rules.');
  }

  return baseline;
};

export const presetRule = (preset: Preset, enabledRules: readonly string[]) => (upstreamRule: string) => {
  const rule = PRESETS[preset](upstreamRule);

  return enabledRules.includes(rule) ? rule : undefined;
};

export const compareBaseline = (preset: Preset, actual: Record<string, number>, expected: Record<string, number>) => {
  const failures: string[] = [];
  const notes: string[] = [];

  for (const rule of union(Object.keys(actual), Object.keys(expected))) {
    const caught = actual[rule];
    const baseline = expected[rule];

    if (caught === undefined || baseline === undefined) {
      throw new Error(`Missing extracted cases or baseline for ${preset} [${rule}].`);
    }

    if (caught < baseline) failures.push(`${preset} [${rule}] catches ${caught}, below the baseline of ${baseline}.`);

    if (caught > baseline) {
      notes.push(
        `${preset} [${rule}] catches ${caught}, above the baseline of ${baseline}. Raise it in scripts/eval-baseline.json and update the README.`,
      );
    }
  }

  return { failures, notes };
};

export const compareFlagged = (
  preset: Preset,
  actual: Record<string, string[]>,
  accepted: Record<string, Record<string, string>>,
) =>
  union(Object.keys(actual), Object.keys(accepted)).flatMap((rule) => {
    const flagged = actual[rule] ?? [];
    const listed = Object.keys(accepted[rule] ?? {});
    return [
      ...difference(flagged, listed).map((name) => `${preset} [${rule}] flags valid case "${name}".`),
      ...difference(listed, flagged).map(
        (name) =>
          `${preset} [${rule}] no longer flags "${name}". Remove it from flagged in scripts/eval-baseline.json.`,
      ),
    ];
  });
