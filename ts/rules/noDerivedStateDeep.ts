import {
  effectOf,
  functionOf,
  hasCleanup,
  isFunction,
  syncsWithBrowser,
  synchronousCalls,
  upstream,
  unwrap,
  writtenOutsideEffects,
} from '../shared/react.ts';
import { defineRule, registerDiagnostic, semantic } from '@biomejs/runtime/plugin';

export const noDerivedStateDeep = defineRule({
  query: semantic('JS_CALL_EXPRESSION'),
  run(node, { model }) {
    const effect = effectOf(model, node);
    // Mount-only and dependency-less effects belong to noInitializeState and noSetStateInEffectWithoutDeps.
    if (
      !effect ||
      effect.mountOnly ||
      !effect.deps ||
      effect.deps.text === '[]' ||
      hasCleanup(effect.callback) ||
      syncsWithBrowser(model, effect.callback)
    )
      return;

    for (const { call, origin } of synchronousCalls(model, effect.callback)) {
      const callee = unwrap(call.callee);
      if (callee?.kind !== 'JS_IDENTIFIER_EXPRESSION') continue;
      const setter = upstream(model, callee, true).find((source) => source.kind === 'setter');
      if (!setter || writtenOutsideEffects(model, setter.binding)) continue;
      const argument = unwrap(call.arguments?.args[0]);
      const updater =
        argument?.kind === 'JS_IDENTIFIER_EXPRESSION' && argument.name ? model.binding(argument.name) : undefined;
      if (isFunction(argument) || (updater && isFunction(functionOf(updater)))) continue;
      const reads = call.arguments ? upstream(model, call.arguments) : [];
      if (reads.some((source) => source.kind === 'state' && source.name === setter.state)) continue;
      if (reads.some((source) => source.kind === 'external')) continue;
      if (!reads.some((source) => source.kind === 'state' || source.kind === 'prop')) continue;

      registerDiagnostic(
        origin,
        'warning',
        `Avoid storing derived state. Compute "${setter.state}" directly during render instead. See https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state`,
      );
    }
  },
});
