# biome-unnecessary-effect

A [Biome](https://biomejs.dev/) plugin that finds unnecessary and incorrect React effects.

The rules follow the React guide [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect). Most of them port an ESLint plugin (see [Credit](#credit)).

## Install

The plugin needs Biome 2.4.5 or newer.

```bash
npm install --save-dev @jacobwolf/biome-unnecessary-effect
# or
pnpm add -D @jacobwolf/biome-unnecessary-effect
# or
bun add -D @jacobwolf/biome-unnecessary-effect
# or
yarn add -D @jacobwolf/biome-unnecessary-effect
```

## Configure

Run this command in the folder that contains your Biome config:

```bash
npx @jacobwolf/biome-unnecessary-effect init
```

The command finds your Biome version and adds the correct entries to the `plugins` array in `biome.json` or `biome.jsonc`. It keeps your other plugins. If it can't read the file (for example, a `biome.jsonc` with comments), it prints the entries for you to add by hand.

Run `init` again after you upgrade Biome from 2.5 to 2.6. It replaces the rule paths with the preset.

### Biome 2.6 and newer

Add the `recommended` preset:

```json
{
  "plugins": ["@jacobwolf/biome-unnecessary-effect/presets/recommended"]
}
```

To also get [`preferUseEffectEvent`](#preferuseeffectevent) (React 19.2 and newer), add the `react19` preset:

```json
{
  "plugins": [
    "@jacobwolf/biome-unnecessary-effect/presets/recommended",
    "@jacobwolf/biome-unnecessary-effect/presets/react19"
  ]
}
```

To use only some rules, list them by name instead of a preset. Don't list a rule that is also in a preset you use, because Biome then reports each problem two times.

```json
{
  "plugins": [
    "@jacobwolf/biome-unnecessary-effect/noDerivedState",
    "@jacobwolf/biome-unnecessary-effect/noEventHandler"
  ]
}
```

### Biome 2.4.5 to 2.5.x

These versions can't load presets. Add one path for each rule:

```json
{
  "plugins": [
    "./node_modules/@jacobwolf/biome-unnecessary-effect/grit/rules/noDerivedState.grit",
    "./node_modules/@jacobwolf/biome-unnecessary-effect/grit/rules/noEventHandler.grit"
  ]
}
```

`init` adds all the `recommended` rules for you. To add `preferUseEffectEvent`, add its path by hand. `init` removes paths that you add by hand, so add them again after each `init` run.

### Deep preset (experimental, Biome 2.6 and newer)

The `deep` preset replaces `noDerivedState` with [`noDerivedStateDeep`](#noderivedstatedeep). This rule is written in TypeScript and uses Biome's semantic model, so it follows variables that the GritQL rules can't follow. All the other rules are the same as in `recommended`.

```bash
npx @jacobwolf/biome-unnecessary-effect init --deep
```

Or add the preset by hand. Use `deep` **instead of** `recommended`. If you use both, Biome reports each problem two times.

```json
{
  "plugins": ["@jacobwolf/biome-unnecessary-effect/presets/deep"]
}
```

Pin Biome to an exact version when you use `deep`. Biome's JavaScript plugin API is a developer preview and can change in a patch release. If a rule can't load, the full lint run stops.

### Supported Biome versions

| Biome           | Enable the plugin with                          | Suppression comment                                                    |
| --------------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| 2.6 and newer   | Presets or rule names                           | `biome-ignore lint/plugin/@jacobwolf/biome-unnecessary-effect/<rule>:` |
| 2.4.5 – 2.5.x   | One `grit/rules/<rule>.grit` path for each rule | `biome-ignore lint/plugin/<rule>:`                                     |
| 2.4.4 and older | Not supported                                   |                                                                        |

On Biome 2.4.0 to 2.4.4, most rules load but never report.

## Suppress a diagnostic

Put a `biome-ignore` comment above the line. Give the rule name and a reason.

Biome 2.6 and newer:

```tsx
// biome-ignore lint/plugin/@jacobwolf/biome-unnecessary-effect/noDerivedState: value comes from a slow parser
setParsed(parse(source));
```

Biome 2.4.5 to 2.5.x:

```tsx
// biome-ignore lint/plugin/noDerivedState: value comes from a slow parser
setParsed(parse(source));
```

With the `deep` preset, use `noDerivedStateDeep` in place of `noDerivedState`.

## Fail CI on warnings

The rules report warnings, and `preferUseEffectEvent` reports information. Biome doesn't fail on warnings by default. To fail CI, run:

```bash
npx biome lint --error-on-warnings
```

## Recommended Biome rules

This plugin doesn't check dependency arrays or hook order. Biome's built-in rules do that. Turn them on:

```json
{
  "linter": {
    "rules": {
      "correctness": {
        "useExhaustiveDependencies": "error",
        "useHookAtTopLevel": "error"
      }
    }
  }
}
```

`useExhaustiveDependencies` also reports an Effect Event (from `useEffectEvent`) in a dependency array.

## Rules

| Rule                                                              | Finds                                                 | Preset      |
| ----------------------------------------------------------------- | ----------------------------------------------------- | ----------- |
| [`noEmptyEffect`](#noemptyeffect)                                 | Effects with an empty body                            | recommended |
| [`noInitializeState`](#noinitializestate)                         | State set once on mount                               | recommended |
| [`noDerivedState`](#noderivedstate)                               | State computed from other state or props              | recommended |
| [`noChainStateUpdates`](#nochainstateupdates)                     | State set because other state changed                 | recommended |
| [`noEventHandler`](#noeventhandler)                               | Effects that do the work of an event handler          | recommended |
| [`noFetchWithoutCleanup`](#nofetchwithoutcleanup)                 | Requests with no cleanup                              | recommended |
| [`noPassLiveStateToParent`](#nopasslivestatetoparent)             | State sent to a parent callback                       | recommended |
| [`noAdjustStateOnPropChange`](#noadjuststateonpropchange)         | State set because a prop changed                      | recommended |
| [`noResetAllStateOnPropChange`](#noresetallstateonpropchange)     | All state reset because a prop changed                | recommended |
| [`noPassDataToParent`](#nopassdatatoparent)                       | Fetched data sent to a parent callback                | recommended |
| [`noExternalStoreSubscription`](#noexternalstoresubscription)     | Subscriptions that `useSyncExternalStore` can replace | recommended |
| [`noEffectEventOutsideEffect`](#noeffecteventoutsideeffect)       | Effect Events called outside an effect                | recommended |
| [`noPassingEffectEvent`](#nopassingeffectevent)                   | Effect Events passed to components or hooks           | recommended |
| [`noAsyncEffectCallback`](#noasynceffectcallback)                 | `async` effect callbacks                              | recommended |
| [`noSetStateInEffectWithoutDeps`](#nosetstateineffectwithoutdeps) | State set in an effect with no dependency array       | recommended |
| [`preferUseEffectEvent`](#preferuseeffectevent)                   | Refs that only copy the latest value                  | react19     |
| [`noDerivedStateDeep`](#noderivedstatedeep)                       | The same as `noDerivedState`, with more data flow     | deep        |

The examples below show code that each rule reports.

### `noEmptyEffect`

```tsx
useEffect(() => {}, []);
```

Remove the effect. [Learn more](https://react.dev/learn/you-might-not-need-an-effect)

### `noInitializeState`

```tsx
const [name, setName] = useState('');
useEffect(() => {
  setName('Ada');
}, []);
```

Pass the value to `useState('Ada')`. For values that differ between server and client, use `useSyncExternalStore`. [Learn more](https://react.dev/reference/react/useState)

### `noDerivedState`

```tsx
function Form({ first, last }) {
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(`${first} ${last}`);
  }, [first, last]);
}
```

Compute the value during render: `` const fullName = `${first} ${last}` ``. [Learn more](https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state)

State that is also set outside effects, such as an input draft the user edits, isn't derived, so this rule skips it. [`noAdjustStateOnPropChange`](#noadjuststateonpropchange) reports it when a prop changes it.

### `noChainStateUpdates`

```tsx
const [round, setRound] = useState(1);
const [isGameOver, setIsGameOver] = useState(false);
useEffect(() => {
  if (round > 10) setIsGameOver(true);
}, [round]);
```

Set both values in the event handler that changes `round`. [Learn more](https://react.dev/learn/you-might-not-need-an-effect#chains-of-computations)

### `noEventHandler`

```tsx
const [form, setForm] = useState(null);
useEffect(() => {
  if (form) {
    submit(form);
  }
}, [form]);
```

Call `submit(form)` from the event handler that calls `setForm`. [Learn more](https://react.dev/learn/you-might-not-need-an-effect#sharing-logic-between-event-handlers)

Conditions that only update state are covered by the state rules, so this rule stays quiet for them.

### `noFetchWithoutCleanup`

```tsx
useEffect(() => {
  fetch(`/search?q=${query}`)
    .then((res) => res.json())
    .then(setResults);
}, [query]);
```

An older, slower response can overwrite a newer one. Return a cleanup that aborts the request or ignores its result, or use a data-fetching library. [Learn more](https://react.dev/learn/you-might-not-need-an-effect#fetching-data)

### `noPassLiveStateToParent`

```tsx
function Child({ onChange }) {
  const [text, setText] = useState('');
  useEffect(() => {
    onChange(text);
  }, [onChange, text]);
}
```

Move `text` into the parent and pass it down as a prop. [Learn more](https://react.dev/learn/you-might-not-need-an-effect#notifying-parent-components-about-state-changes)

### `noAdjustStateOnPropChange`

```tsx
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);
  useEffect(() => {
    setSelection(null);
  }, [items]);
}
```

Adjust the state during render when `items` changes, or store an ID instead of the selected item. [Learn more](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)

### `noResetAllStateOnPropChange`

```tsx
function ProfilePage({ userId }) {
  const [comment, setComment] = useState('');
  const [draft, setDraft] = useState('');
  useEffect(() => {
    setComment('');
    setDraft('');
  }, [userId]);
}
```

Render the component with `key={userId}`. React then resets all its state when `userId` changes. [Learn more](https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes)

### `noPassDataToParent`

```tsx
function Child({ onLoad }) {
  const { data } = useQuery('/items');
  useEffect(() => {
    onLoad(data);
  }, [data, onLoad]);
}
```

Call `useQuery` in the parent and pass `data` down as a prop. [Learn more](https://react.dev/learn/you-might-not-need-an-effect#passing-data-to-the-parent)

### `noExternalStoreSubscription`

```tsx
const [isOnline, setIsOnline] = useState(true);
useEffect(() => {
  const update = () => setIsOnline(navigator.onLine);
  update();
  window.addEventListener('online', update);
  return () => window.removeEventListener('online', update);
}, []);
```

Read the value with `useSyncExternalStore`. [Learn more](https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store)

### `noEffectEventOutsideEffect`

```tsx
const onTick = useEffectEvent(() => props.onTick());
onTick();
```

Call an Effect Event only from an effect or from another Effect Event. Don't call it during render or from an event handler. [Learn more](https://react.dev/reference/react/useEffectEvent)

### `noPassingEffectEvent`

```tsx
const onTick = useEffectEvent(() => props.onTick());
return <Timer onTick={onTick} />;
```

Declare the Effect Event next to the effect that calls it. [Learn more](https://react.dev/reference/react/useEffectEvent)

### `noAsyncEffectCallback`

```tsx
useEffect(async () => {
  await fetch(`/items/${id}`);
}, [id]);
```

React uses the returned Promise as a cleanup function. Declare an `async` function in the effect and call it. [Learn more](https://react.dev/reference/react/useEffect#fetching-data-with-effects)

### `noSetStateInEffectWithoutDeps`

```tsx
const [count, setCount] = useState(0);
useEffect(() => {
  setCount(count + 1);
});
```

The effect runs after every render and sets state, so the component renders forever. Add a dependency array, or compute the value during render. [Learn more](https://react.dev/reference/react/useEffect#my-effect-keeps-re-running-in-an-infinite-cycle)

### `preferUseEffectEvent`

```tsx
const latest = useRef(callback);
useEffect(() => {
  latest.current = callback;
});
```

On React 19.2 and newer, read `callback` in a `useEffectEvent` function. This rule is only in the `react19` preset, because the plugin can't find your React version. [Learn more](https://react.dev/reference/react/useEffectEvent)

### `noDerivedStateDeep`

This rule finds the same problems as `noDerivedState`. It also follows setter aliases, local helper functions and renamed imports.

```tsx
function Greeting({ name }) {
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const update = setGreeting;
    update(`Hello, ${name}`);
  }, [name]);
}
```

`noDerivedState` doesn't report this code. [Learn more](https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state)

## Known limits

The GritQL rules match names, not bindings, and follow data through one local variable only. Because of this:

- **They miss setter aliases**, such as `const reset = setUser`.
- **They miss wrapper setters and helper calls**, such as `const resetUser = () => setUser(null)`.
- **They miss values derived from hook data** before the value goes to a parent callback.
- **They miss renamed imports**, such as `import { useEffect as useFx }`.
- A setter called inside a renamed effect hook counts as a write outside effects, so `noDerivedState` skips that state.
- **They can report shadowed names.** A local `const error` in an effect counts as the state variable `error`.

`noInitializeState` doesn't report an effect with no dependency array. `noSetStateInEffectWithoutDeps` reports it.

The `deep` preset fixes the first, second and fourth items, but only for `noDerivedState`. The other rules still use GritQL.

On the ESLint plugin's rule and util test cases (v1.2.0), the `recommended` preset finds 123 of 162 problems and the `deep` preset finds 134. Each preset reports 4 of the 135 valid cases; `flagged` in `scripts/eval-baseline.json` lists each one with the reason.

Biome runs each plugin on each file. On a 696-file React codebase, all the GritQL rules together add about 11 seconds to a lint run.

## Upgrade from 0.1

1. Upgrade the package. Biome 2.4.5 or newer is necessary.
2. Run `npx @jacobwolf/biome-unnecessary-effect init`. Version 0.2.0 removes `grit/react-effects.grit`, so Biome stops with an error on the 0.1 `plugins` entry. `init` replaces that entry. The package no longer runs a script at install time.
3. Update your suppression comments. `biome-ignore lint/plugin/react-effects` no longer works. Use the name of each rule (see [Suppress a diagnostic](#suppress-a-diagnostic)).

Renamed rules:

| 0.1                          | 0.2                                           |
| ---------------------------- | --------------------------------------------- |
| `avoidEmptyEffect`           | `noEmptyEffect`                               |
| `avoidInitializingState`     | `noInitializeState`                           |
| `avoidDerivedOrChainedState` | `noDerivedState` and `noChainStateUpdates`    |
| `avoidEventHandler`          | `noEventHandler`                              |
| `avoidDataFetchingInEffect`  | `noFetchWithoutCleanup` (reports fewer cases) |
| `avoidParentChildCoupling`   | `noPassLiveStateToParent`                     |

## Contributing

Open an issue if a rule reports correct code or misses a problem. Include a short code sample.

```bash
bun install
bun test
```

Edit shared patterns in `grit/prelude.grit`, then run `bun run sync:prelude` to copy them into each rule file.

To score the presets against the ESLint plugin's test cases (see [Known limits](#known-limits)), run `bun run eval`. It downloads the test cases for the installed ESLint plugin version, so it needs network access. It refuses to run them unless the version's tag resolves to the `upstreamCommit` in `scripts/eval-baseline.json`, so update that SHA when you bump the plugin. CI fails if a rule reports a valid case that `flagged` doesn't list, if `flagged` lists a case the rule no longer reports, or if a rule catches fewer cases in a preset than `scripts/eval-baseline.json` records for that rule. When a change catches more, raise the rule's baseline and the numbers in Known limits.

## Credit

Most rules port [eslint-plugin-react-you-might-not-need-an-effect](https://github.com/NickvanDyke/eslint-plugin-react-you-might-not-need-an-effect) by [@NickvanDyke](https://github.com/NickvanDyke).

## License

[Beerware](LICENSE).
