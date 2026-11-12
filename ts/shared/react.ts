import type {
  AnyJsAstNode,
  AnyJsIdentifierReference,
  Binding,
  JsCallExpression,
  SemanticModel,
} from '@biomejs/runtime/plugin';

const MOUNT_HOOKS = new Set(['useMount', 'useEffectOnce', 'useMountEffect']);
const EFFECT_HOOKS = new Set([
  'useEffect',
  'useDeepCompareEffect',
  'useCustomCompareEffect',
  'useShallowEffect',
  ...MOUNT_HOOKS,
]);
const LAYOUT_HOOKS = new Set(['useLayoutEffect', 'useInsertionEffect']);
const COMPONENT_OR_HOOK = /^(?:[A-Z]|use[A-Z])/;

export type Source =
  | { kind: 'state'; name: string }
  | { kind: 'setter'; state: string; binding: Binding }
  | { kind: 'prop'; name: string };

const isFunction = (node: AnyJsAstNode | undefined) =>
  node?.kind === 'JS_ARROW_FUNCTION_EXPRESSION' ||
  node?.kind === 'JS_FUNCTION_EXPRESSION' ||
  node?.kind === 'JS_FUNCTION_DECLARATION' ||
  node?.kind === 'JS_METHOD_OBJECT_MEMBER';

const isAsync = (fn: AnyJsAstNode): boolean => isFunction(fn) && fn.asyncToken !== undefined;

const bodyOf = (fn: AnyJsAstNode): AnyJsAstNode | undefined => (isFunction(fn) ? fn.body : undefined);

/**
 * The plugin API returns a fresh wrapper object on every access and exposes no source ranges,
 * so nodes are identified by their kind and text plus the kinds and lengths of their ancestors.
 */
const nodeKey = (node: AnyJsAstNode): string =>
  [node, ...node.ancestors()].map((part) => `${part.kind}:${part.text.length}`).join('/') + node.text;

const findAncestor = (node: AnyJsAstNode, kind: string) => node.ancestors().find((ancestor) => ancestor.kind === kind);

const unwrap = (node: AnyJsAstNode | undefined): AnyJsAstNode | undefined => {
  let current = node;
  while (
    current &&
    [
      'JS_PARENTHESIZED_EXPRESSION',
      'TS_AS_EXPRESSION',
      'TS_NON_NULL_ASSERTION_EXPRESSION',
      'TS_SATISFIES_EXPRESSION',
    ].includes(current.kind)
  ) {
    current = current.children()[0];
  }
  return current;
};

const calleeName = (callee: AnyJsAstNode | undefined) => {
  const node = unwrap(callee);
  if (node?.kind === 'JS_IDENTIFIER_EXPRESSION') return node.text;
  if (node?.kind === 'JS_STATIC_MEMBER_EXPRESSION' && node.object?.text === 'React') return node.member?.text;
  return undefined;
};

const initializerOf = (binding: Binding) => {
  const declarator = binding
    .syntax()
    .ancestors()
    .find((ancestor) => isFunction(ancestor) || ancestor.kind === 'JS_VARIABLE_DECLARATOR');

  if (declarator?.kind !== 'JS_VARIABLE_DECLARATOR') return undefined;
  return { declarator, init: unwrap(declarator.initializer?.expression) };
};

const functionOf = (binding: Binding): AnyJsAstNode | undefined => {
  const parent = binding.syntax().parent;
  if (parent?.kind === 'JS_FUNCTION_DECLARATION') return parent;
  const init = initializerOf(binding)?.init;
  return isFunction(init) ? init : undefined;
};

const isComponentOrHook = (fn: AnyJsAstNode) => {
  const own = fn.kind === 'JS_FUNCTION_DECLARATION' || fn.kind === 'JS_FUNCTION_EXPRESSION' ? fn.id?.text : undefined;
  const assigned = fn
    .ancestors()
    .find(
      (ancestor) =>
        !['JS_INITIALIZER_CLAUSE', 'JS_CALL_ARGUMENTS', 'JS_CALL_EXPRESSION', 'JS_PARENTHESIZED_EXPRESSION'].includes(
          ancestor.kind,
        ),
    );

  const name = own ?? (assigned?.kind === 'JS_VARIABLE_DECLARATOR' ? assigned.id?.text : undefined);
  return !!name && COMPONENT_OR_HOOK.test(name);
};

const classify = (binding: Binding): Source | undefined => {
  const node = binding.syntax();
  const declaration = initializerOf(binding);
  const hook = declaration?.init?.kind === 'JS_CALL_EXPRESSION' ? calleeName(declaration.init.callee) : undefined;

  if (hook === 'useState' && declaration?.declarator.id?.kind === 'JS_ARRAY_BINDING_PATTERN') {
    const elements = declaration.declarator.id.elements;
    const index = elements.findIndex((element) => element.text.split('=')[0]?.trim() === node.text);
    const state = elements[0]?.text.split('=')[0]?.trim() ?? node.text;
    if (index === 0) return { kind: 'state', name: node.text };
    if (index === 1) return { kind: 'setter', state, binding };
  }

  if (hook === 'useContext') return { kind: 'prop', name: node.text };

  const ancestors = node.ancestors();
  const fnIndex = ancestors.findIndex(isFunction);
  const fn = ancestors[fnIndex];
  const isParameter =
    fnIndex === 0
      ? fn?.kind === 'JS_ARROW_FUNCTION_EXPRESSION'
      : ancestors.slice(0, fnIndex).some((ancestor) => ancestor.kind === 'JS_PARAMETERS');

  if (fn && isParameter && isComponentOrHook(fn)) return { kind: 'prop', name: node.text };
  return undefined;
};

const references = (node: AnyJsAstNode, skipCallArguments = false): AnyJsIdentifierReference[] => {
  if (node.kind === 'JS_REFERENCE_IDENTIFIER') return [node];
  if (skipCallArguments && node.kind === 'JS_CALL_ARGUMENTS') return [];
  return node.children().flatMap((child) => references(child, skipCallArguments));
};

/**
 * Like the ESLint plugin, tracing doesn't follow arguments passed to calls in initializers:
 * `useQuery({ id })` returns external data, not something derived from `id`.
 */
export const upstream = (
  model: SemanticModel,
  node: AnyJsAstNode,
  seen = new Set<string>(),
  skipCallArguments = false,
): Source[] =>
  references(node, skipCallArguments).flatMap((reference) => {
    const binding = model.binding(reference);
    const key = binding && nodeKey(binding.syntax());
    if (!binding || !key || seen.has(key)) return [];
    seen.add(key);

    const source = classify(binding);
    if (source) return [source];

    const fn = functionOf(binding);
    if (fn) return isAsync(fn) ? [] : upstream(model, fn, seen, true);
    const init = initializerOf(binding)?.init;
    return init ? upstream(model, init, seen, true) : [];
  });

export interface Effect {
  callback: AnyJsAstNode;
  deps: AnyJsAstNode | undefined;
  mountOnly: boolean;
}

const hookName = (model: SemanticModel, call: JsCallExpression): string | undefined => {
  const callee = unwrap(call.callee);
  if (callee?.kind === 'JS_IDENTIFIER_EXPRESSION' && callee.name) {
    const binding = model.binding(callee.name);
    const specifier = binding && findAncestor(binding.syntax(), 'JS_NAMED_IMPORT_SPECIFIER');
    if (specifier) return specifier.text.split(/\s+as\s+/)[0]?.trim();
  }
  return calleeName(callee);
};

export const effectOf = (model: SemanticModel, call: AnyJsAstNode): Effect | undefined => {
  if (call.kind !== 'JS_CALL_EXPRESSION') return undefined;

  const name = hookName(model, call);
  if (!name || !EFFECT_HOOKS.has(name)) return undefined;

  const first = unwrap(call.arguments?.args[0]);
  let fn = first;
  if (first?.kind === 'JS_IDENTIFIER_EXPRESSION' && first.name) {
    const binding = model.binding(first.name);
    fn = binding && functionOf(binding);
  }

  if (!isFunction(fn) || isAsync(fn)) return undefined;
  return { callback: fn, deps: unwrap(call.arguments?.args[1]), mountOnly: MOUNT_HOOKS.has(name) };
};

export const writtenOutsideEffects = (model: SemanticModel, setter: Binding): boolean =>
  setter.allReferences().some(
    (reference) =>
      !reference
        .syntax()
        .ancestors()
        .some((ancestor) => {
          if (ancestor.kind !== 'JS_CALL_EXPRESSION') return false;
          const name = hookName(model, ancestor);
          return !!name && (EFFECT_HOOKS.has(name) || LAYOUT_HOOKS.has(name));
        }),
  );

export interface SynchronousCall {
  call: JsCallExpression;
  // The call in the effect body that leads here; differs from `call` inside helper functions.
  origin: JsCallExpression;
}

export const synchronousCalls = (
  model: SemanticModel,
  fn: AnyJsAstNode,
  origin?: JsCallExpression,
  seen = new Set<string>(),
): SynchronousCall[] => {
  const key = nodeKey(fn);
  const body = bodyOf(fn);
  if (seen.has(key) || !body) return [];
  seen.add(key);

  const calls: SynchronousCall[] = [];
  const visit = (node: AnyJsAstNode): void => {
    if (isFunction(node)) return;
    if (node.kind === 'JS_CALL_EXPRESSION') {
      calls.push({ call: node, origin: origin ?? node });

      const callee = unwrap(node.callee);
      const binding =
        callee?.kind === 'JS_IDENTIFIER_EXPRESSION' && callee.name ? model.binding(callee.name) : undefined;
      const helper = binding && functionOf(binding);
      if (helper && !isAsync(helper)) calls.push(...synchronousCalls(model, helper, origin ?? node, seen));
    }
    for (const child of node.children()) visit(child);
  };

  visit(body);
  return calls;
};

export const hasCleanup = (fn: AnyJsAstNode): boolean => {
  const body = bodyOf(fn);
  // A concise arrow body cleans up when it evaluates to a function: `() => () => unsubscribe()`.
  if (body?.kind !== 'JS_FUNCTION_BODY') return isFunction(body);

  const visit = (node: AnyJsAstNode): boolean =>
    !isFunction(node) && ((node.kind === 'JS_RETURN_STATEMENT' && !!node.argument) || node.children().some(visit));
  return visit(body);
};
