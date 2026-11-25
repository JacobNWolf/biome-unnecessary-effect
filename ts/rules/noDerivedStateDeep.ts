import {
  effectOf,
  functionOf,
  hasCleanup,
  isFunction,
  nodeKey,
  syncsWithBrowser,
  synchronousCalls,
  upstream,
  unwrap,
  writtenOutsideEffects,
} from '../shared/react.ts';
import type { AnyJsAstNode, Binding, JsCallExpression, SemanticModel } from '@biomejs/runtime/plugin';
import { defineRule, registerDiagnostic, semantic } from '@biomejs/runtime/plugin';

const sameNode = (a: AnyJsAstNode | undefined, b: AnyJsAstNode | undefined): boolean =>
  !!a && !!b && nodeKey(a) === nodeKey(b);

const sameBinding = (a: Binding | undefined, b: Binding | undefined): boolean =>
  !!a && !!b && sameNode(a.syntax(), b.syntax());

const containsReferenceTo = (model: SemanticModel, node: AnyJsAstNode, target: Binding): boolean => {
  if (node.kind === 'JS_REFERENCE_IDENTIFIER') return sameBinding(model.binding(node), target);
  return node.children().some((child) => containsReferenceTo(model, child, target));
};

const isWithin = (node: AnyJsAstNode, ancestor: AnyJsAstNode): boolean => {
  const target = nodeKey(ancestor);
  return nodeKey(node) === target || node.ancestors().some((part) => nodeKey(part) === target);
};

const stateDeclarationOf = (model: SemanticModel, setter: Binding) => {
  const declarator = setter
    .syntax()
    .ancestors()
    .find((ancestor) => isFunction(ancestor) || ancestor.kind === 'JS_VARIABLE_DECLARATOR');
  if (declarator?.kind !== 'JS_VARIABLE_DECLARATOR') return undefined;

  let stateBinding: Binding | undefined;
  if (declarator.id?.kind === 'JS_ARRAY_BINDING_PATTERN') {
    const first = declarator.id.elements[0];
    const bindingNode =
      first?.kind === 'JS_ARRAY_BINDING_PATTERN_ELEMENT'
        ? first.pattern?.kind === 'JS_IDENTIFIER_BINDING'
          ? first.pattern
          : undefined
        : undefined;
    if (bindingNode) stateBinding = model.asBinding(bindingNode);
  }

  const initCall = unwrap(declarator.initializer?.expression);
  const init = initCall?.kind === 'JS_CALL_EXPRESSION' ? initCall.arguments?.args[0] : undefined;
  return { stateBinding, init };
};

const setterCalls = (model: SemanticModel, binding: Binding, seen = new Set<string>()): JsCallExpression[] => {
  const key = nodeKey(binding.syntax());
  if (seen.has(key)) return [];
  seen.add(key);

  const calls: JsCallExpression[] = [];
  for (const reference of binding.allReferences()) {
    const expression = reference.syntax().parent;
    if (expression?.kind !== 'JS_IDENTIFIER_EXPRESSION') continue;
    const parent = expression.parent;
    if (parent?.kind === 'JS_CALL_EXPRESSION' && sameNode(unwrap(parent.callee), expression)) {
      calls.push(parent);
      continue;
    }
    if (parent?.kind === 'JS_INITIALIZER_CLAUSE' && parent.parent?.kind === 'JS_VARIABLE_DECLARATOR') {
      const id = parent.parent.id;
      const alias = id?.kind === 'JS_IDENTIFIER_BINDING' ? model.asBinding(id) : undefined;
      if (alias) calls.push(...setterCalls(model, alias, seen));
    }
  }
  return calls;
};

const isUpdaterArgument = (model: SemanticModel, call: JsCallExpression): boolean => {
  const argument = unwrap(call.arguments?.args[0]);
  const updater =
    argument?.kind === 'JS_IDENTIFIER_EXPRESSION' && argument.name ? model.binding(argument.name) : undefined;
  return isFunction(argument) || (!!updater && isFunction(functionOf(updater)));
};

const isStateReference = (model: SemanticModel, node: AnyJsAstNode | undefined, stateBinding: Binding): boolean => {
  const value = unwrap(node);
  return (
    value?.kind === 'JS_IDENTIFIER_EXPRESSION' && !!value.name && sameBinding(model.binding(value.name), stateBinding)
  );
};

const comparesStateToArg = (
  model: SemanticModel,
  node: AnyJsAstNode,
  stateBinding: Binding,
  arg: AnyJsAstNode | undefined,
): boolean => {
  if (!arg) return false;
  if (node.kind === 'JS_BINARY_EXPRESSION' && (node.operatorToken === '!==' || node.operatorToken === '!=')) {
    const left = unwrap(node.left);
    const right = unwrap(node.right);
    const argText = arg.text.trim();
    if (
      (isStateReference(model, left, stateBinding) && right?.text.trim() === argText) ||
      (isStateReference(model, right, stateBinding) && left?.text.trim() === argText)
    )
      return true;
  }
  return node.children().some((child) => comparesStateToArg(model, child, stateBinding, arg));
};

const hasAccumulatingOrSelfGuardedWrite = (
  model: SemanticModel,
  calls: JsCallExpression[],
  state: string,
  stateBinding: Binding | undefined,
): boolean =>
  calls.some((call) => {
    if (isUpdaterArgument(model, call)) return true;
    const reads = call.arguments ? upstream(model, call.arguments) : [];
    if (reads.some((source) => source.kind === 'state' && source.name === state)) return true;
    if (stateBinding) {
      const arg = unwrap(call.arguments?.args[0]);
      for (const ancestor of call.ancestors()) {
        if (
          ancestor.kind === 'JS_IF_STATEMENT' &&
          ancestor.test &&
          containsReferenceTo(model, ancestor.test, stateBinding) &&
          !comparesStateToArg(model, ancestor.test, stateBinding, arg)
        )
          return true;
      }
    }
    return false;
  });

const isBareIfInitializedSnapshot = (
  model: SemanticModel,
  node: AnyJsAstNode,
  arg: AnyJsAstNode | undefined,
  callback: AnyJsAstNode,
  stateInit: AnyJsAstNode | undefined,
): boolean => {
  if (!stateInit || !arg) return false;
  for (const ancestor of node.ancestors()) {
    if (sameNode(ancestor, callback)) break;
    if (ancestor.kind !== 'JS_IF_STATEMENT' || ancestor.elseClause) continue;
    const test = unwrap(ancestor.test);
    if (test?.kind !== 'JS_IDENTIFIER_EXPRESSION' || !test.name) continue;
    const testBinding = model.binding(test.name);
    if (!testBinding || !containsReferenceTo(model, stateInit, testBinding)) continue;
    const matchesArg =
      (arg.kind === 'JS_IDENTIFIER_EXPRESSION' && !!arg.name && sameBinding(model.binding(arg.name), testBinding)) ||
      ((arg.kind === 'JS_OBJECT_EXPRESSION' || arg.kind === 'JS_ARRAY_EXPRESSION') &&
        containsReferenceTo(model, arg, testBinding));
    if (matchesArg) return true;
  }
  return false;
};

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

    const calls = synchronousCalls(model, effect.callback);
    const setterOfCall = (call: JsCallExpression) => {
      const callee = unwrap(call.callee);
      if (callee?.kind !== 'JS_IDENTIFIER_EXPRESSION') return undefined;
      return upstream(model, callee, true).find((source) => source.kind === 'setter');
    };

    for (const { call, origin } of calls) {
      const setter = setterOfCall(call);
      if (!setter || writtenOutsideEffects(model, setter.binding)) continue;
      if (isUpdaterArgument(model, call)) continue;

      const declaration = stateDeclarationOf(model, setter.binding);
      const allSetterCalls = setterCalls(model, setter.binding);
      if (hasAccumulatingOrSelfGuardedWrite(model, allSetterCalls, setter.state, declaration?.stateBinding)) continue;
      if (
        isBareIfInitializedSnapshot(model, origin, unwrap(call.arguments?.args[0]), effect.callback, declaration?.init)
      )
        continue;

      const reads = call.arguments ? upstream(model, call.arguments) : [];
      if (reads.some((source) => source.kind === 'state' && source.name === setter.state)) continue;
      if (reads.some((source) => source.kind === 'external')) continue;

      let derived = reads.some((source) => source.kind === 'state' || source.kind === 'prop');
      if (!derived) {
        const ancestors: AnyJsAstNode[] = [];
        for (const ancestor of origin.ancestors()) {
          if (sameNode(ancestor, effect.callback)) break;
          ancestors.push(ancestor);
        }
        const writesIn = (branch: AnyJsAstNode) =>
          calls.some(
            (other) => isWithin(other.origin, branch) && sameBinding(setterOfCall(other.call)?.binding, setter.binding),
          );
        derived = ancestors.some((ancestor, index) => {
          if (
            ancestor.kind !== 'JS_IF_STATEMENT' ||
            !ancestor.test ||
            !ancestor.consequent ||
            !ancestor.elseClause?.alternate
          )
            return false;
          if (!isWithin(origin, ancestor.consequent)) return false;
          const shadowedByOuterElseIf = ancestors
            .slice(index + 1)
            .some(
              (outer) =>
                outer.kind === 'JS_IF_STATEMENT' &&
                !!outer.consequent &&
                !!outer.elseClause &&
                isWithin(ancestor, outer.elseClause) &&
                writesIn(outer.consequent),
            );
          if (shadowedByOuterElseIf) return false;
          const testReads = upstream(model, ancestor.test);
          if (testReads.some((source) => source.kind === 'external')) return false;
          if (!testReads.some((source) => source.kind === 'state' || source.kind === 'prop')) return false;
          return writesIn(ancestor.consequent) && writesIn(ancestor.elseClause.alternate);
        });
      }
      if (!derived) continue;

      registerDiagnostic(
        origin,
        'warning',
        `Avoid storing derived state. Compute "${setter.state}" directly during render instead. See https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state`,
      );
    }
  },
});
