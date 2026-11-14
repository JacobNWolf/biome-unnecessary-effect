import type {
  AnyJsAstNode,
  AnyJsIdentifierReference,
  Binding,
  JsCallExpression,
  SemanticModel,
} from '@biomejs/runtime/plugin';

const MOUNT_HOOKS = new Set(['useMount', 'useEffectOnce', 'useMountEffect']);
const REACT_MODULES = new Set(['react', 'preact/hooks', 'preact/compat', '@wordpress/element']);
const EFFECT_WRAPPERS: Record<string, Set<string> | undefined> = {
  'react-use': new Set(['useMount', 'useEffectOnce', 'useDeepCompareEffect', 'useCustomCompareEffect']),
  ahooks: new Set(['useMount', 'useDeepCompareEffect']),
  '@react-hookz/web': new Set(['useMountEffect', 'useDeepCompareEffect']),
  '@mantine/hooks': new Set(['useShallowEffect']),
  'primereact/hooks': new Set(['useMountEffect']),
  'use-deep-compare-effect': new Set(['default']),
};
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

const WRAPPERS = [
  'JS_PARENTHESIZED_EXPRESSION',
  'TS_AS_EXPRESSION',
  'TS_NON_NULL_ASSERTION_EXPRESSION',
  'TS_SATISFIES_EXPRESSION',
];

const unwrap = (node: AnyJsAstNode | undefined): AnyJsAstNode | undefined => {
  let current = node;
  while (current && WRAPPERS.includes(current.kind)) {
    current = current.children()[0];
  }
  return current;
};

const importOf = (model: SemanticModel, node: AnyJsAstNode | undefined) => {
  if (node?.kind !== 'JS_IDENTIFIER_EXPRESSION' || !node.name) return undefined;
  const specifier = model.binding(node.name)?.syntax().parent;
  if (!specifier) return undefined;
  const name =
    specifier.kind === 'JS_NAMED_IMPORT_SPECIFIER'
      ? specifier.name?.text
      : specifier.kind === 'JS_SHORTHAND_NAMED_IMPORT_SPECIFIER'
        ? node.text
        : specifier.kind === 'JS_DEFAULT_IMPORT_SPECIFIER'
          ? 'default'
          : specifier.kind === 'JS_NAMESPACE_IMPORT_SPECIFIER'
            ? '*'
            : undefined;
  if (!name) return undefined;
  const declaration = specifier.ancestors().find((ancestor) => ancestor.kind === 'JS_IMPORT');
  if (declaration?.kind !== 'JS_IMPORT') return undefined;
  const module = declaration.importClause?.source?.text.slice(1, -1);
  return module ? { module, name } : undefined;
};

const reactHook = (model: SemanticModel, callee: AnyJsAstNode | undefined): string | undefined => {
  const node = unwrap(callee);
  if (node?.kind === 'JS_IDENTIFIER_EXPRESSION') {
    const imported = importOf(model, node);
    return imported && REACT_MODULES.has(imported.module) ? imported.name : node.text;
  }
  if (node?.kind !== 'JS_STATIC_MEMBER_EXPRESSION') return undefined;
  const object = unwrap(node.object);
  const imported = importOf(model, object);
  return object?.text === 'React' ||
    (imported && REACT_MODULES.has(imported.module) && ['*', 'default'].includes(imported.name))
    ? node.member?.text
    : undefined;
};

const wrapperHook = (model: SemanticModel, callee: AnyJsAstNode | undefined): string | undefined => {
  const node = unwrap(callee);
  const imported = importOf(model, node?.kind === 'JS_STATIC_MEMBER_EXPRESSION' ? unwrap(node.object) : node);
  const name =
    node?.kind === 'JS_STATIC_MEMBER_EXPRESSION'
      ? imported?.name === '*'
        ? node.member?.text
        : undefined
      : imported?.name;
  return imported && name && EFFECT_WRAPPERS[imported.module]?.has(name) ? name : undefined;
};

const effectHook = (model: SemanticModel, call: JsCallExpression) =>
  wrapperHook(model, call.callee) ?? (reactHook(model, call.callee) === 'useEffect' ? 'useEffect' : undefined);

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
        ![
          'JS_INITIALIZER_CLAUSE',
          'JS_CALL_ARGUMENTS',
          'JS_CALL_EXPRESSION',
          'JS_CALL_ARGUMENT_LIST',
          ...WRAPPERS,
        ].includes(ancestor.kind),
    );

  const name = own ?? (assigned?.kind === 'JS_VARIABLE_DECLARATOR' ? assigned.id?.text : undefined);
  return !!name && COMPONENT_OR_HOOK.test(name);
};

const classify = (model: SemanticModel, binding: Binding): Source | undefined => {
  const node = binding.syntax();
  const declaration = initializerOf(binding);
  const hook = declaration?.init?.kind === 'JS_CALL_EXPRESSION' ? reactHook(model, declaration.init.callee) : undefined;

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
export const upstream = (model: SemanticModel, node: AnyJsAstNode, constAliasesOnly = false): Source[] => {
  const seen = new Set<string>();
  const trace = (node: AnyJsAstNode, skipCallArguments = false): Source[] =>
    references(node, skipCallArguments).flatMap((reference) => {
      const binding = model.binding(reference);
      const key = binding && nodeKey(binding.syntax());
      if (!binding || !key || seen.has(key)) return [];
      seen.add(key);
      const source = classify(model, binding);
      if (source) return [source];
      const fn = functionOf(binding);
      if (fn) return isAsync(fn) ? [] : trace(fn, true);
      const declaration = initializerOf(binding);
      const parent = declaration?.declarator.parent?.parent;
      // A `let` setter alias may be reassigned before the call.
      if (constAliasesOnly && !(parent?.kind === 'JS_VARIABLE_DECLARATION' && parent.kindToken === 'const')) return [];
      return declaration?.init ? trace(declaration.init, true) : [];
    });
  return trace(node);
};

export interface Effect {
  callback: AnyJsAstNode;
  deps: AnyJsAstNode | undefined;
  mountOnly: boolean;
}

export const effectOf = (model: SemanticModel, call: AnyJsAstNode): Effect | undefined => {
  if (call.kind !== 'JS_CALL_EXPRESSION') return undefined;

  const name = effectHook(model, call);
  if (!name) return undefined;

  const first = unwrap(call.arguments?.args[0]);
  let fn = first;
  if (first?.kind === 'JS_IDENTIFIER_EXPRESSION' && first.name) {
    const binding = model.binding(first.name);
    fn = binding && functionOf(binding);
  }

  if (!isFunction(fn) || isAsync(fn)) return undefined;
  return { callback: fn, deps: unwrap(call.arguments?.args[1]), mountOnly: MOUNT_HOOKS.has(name) };
};

const isEffectCall = (model: SemanticModel, node: AnyJsAstNode): boolean => {
  if (node.kind !== 'JS_CALL_EXPRESSION') return false;

  return !!effectHook(model, node) || LAYOUT_HOOKS.has(reactHook(model, node.callee) ?? '');
};

// A setter in a local helper or alias runs wherever the helper is called. A component or hook boundary means
// render or handler code, which counts as outside effects.
const usedOnlyInEffects = (model: SemanticModel, binding: Binding, seen = new Set<string>()): boolean => {
  const key = nodeKey(binding.syntax());

  if (seen.has(key)) return true;
  seen.add(key);

  return binding.allReferences().every((reference) => {
    for (const ancestor of reference.syntax().ancestors()) {
      if (isEffectCall(model, ancestor)) return true;

      if (ancestor.kind === 'JS_VARIABLE_DECLARATOR' || ancestor.kind === 'JS_FUNCTION_DECLARATION') {
        const id = ancestor.id;

        if (id?.kind !== 'JS_IDENTIFIER_BINDING' || COMPONENT_OR_HOOK.test(id.text)) return false;

        const local = model.asBinding(id);

        return !!local && usedOnlyInEffects(model, local, seen);
      }
    }

    return false;
  });
};

export const writtenOutsideEffects = (model: SemanticModel, setter: Binding): boolean =>
  !usedOnlyInEffects(model, setter);

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
