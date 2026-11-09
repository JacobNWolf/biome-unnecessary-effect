import { effectOf, hasCleanup, synchronousCalls, upstream } from '../shared/react.ts';
import { defineRule, registerDiagnostic, semantic } from '@biomejs/runtime/plugin';

export const noDerivedStateDeep = defineRule({
  query: semantic('JS_CALL_EXPRESSION'),
  run(node, { model }) {
    const effect = effectOf(model, node);
    // Mount-only and dependency-less effects belong to noInitializeState and noSetStateInEffectWithoutDeps.
    if (!effect || effect.mountOnly || !effect.deps || effect.deps.text === '[]' || hasCleanup(effect.callback)) return;

    for (const { call, origin } of synchronousCalls(model, effect.callback)) {
      if (!call.callee) continue;
      const setter = upstream(model, call.callee).find((source) => source.kind === 'setter');
      if (!setter) continue;
      const reads = call.arguments ? upstream(model, call.arguments) : [];
      if (!reads.some((source) => source.kind === 'state' || source.kind === 'prop')) continue;

      registerDiagnostic(
        origin,
        'warning',
        `Avoid storing derived state. Compute "${setter.state}" directly during render instead. See https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state`,
      );
    }
  },
});
