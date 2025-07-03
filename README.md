# Biome - React - Unnecessary Effect
This is a plugin for [Biome](https://biomejs.dev/), the JavaScript and TypeScript linter, that identifies bad uses of the `useEffect` hook in React. 

This plugin is heavily inspired and the code in it draws on rules in [@NickvanDyke](https://github.com/NickvanDyke)'s [eslint-plugin-react-you-might-not-need-an-effect](https://github.com/NickvanDyke/eslint-plugin-react-you-might-not-need-an-effect) package, which provides a similar functionality for ESLint. 

>[!WARNING] 
> This plugin is currently a work in progress. While it has been tested to work with the rudimentary examples found in the tests directory, you may find false positives. Please open a GitHub issue if you encounter one.

## Installation

You can add this plugin to your project using your preferred package manager:

```bash
npm install --save-dev @jacobwolf/biome-unnecessary-effect
# or
pnpm add -D @jacobwolf/biome-unnecessary-effect
# or
bun add -D biome-unnecessary-effect
# or
yarn add -D biome-unnecessary-effect
```

## Usage

To use this plugin, you must have Biome 2.0+ installed. You can do so and configure Biome according to [their documentation](https://biomejs.dev/guides/getting-started). Plugins are not supported in Biome versions prior to 2.0.

After installation, the plugin will automatically configure your `biome.json` file, adding the respective plugin rule. No manual setup is required!

Then, you can run Biome:

```bash
npx biome lint --write
# or
bunx biome lint --write
```

## Rules

This plugin currently includes the following rules:

*   **avoidEmptyEffect**: Identifies and flags empty `useEffect` or `useLayoutEffect` hooks.

*   **avoidInitializingState**: Flags `useEffect` or `useLayoutEffect` hooks that are used solely for initializing state. This should ideally be done directly with `useState`.

*   **avoidDerivedOrChainedState**: Warns against storing derived state or chaining state updates within `useEffect` or `useLayoutEffect`. Consider computing derived values during render or combining state updates into a single event handler.

*   **avoidDataFetchingInEffect**: Warns against directly fetching data inside `useEffect` or `useLayoutEffect`. Recommends using data fetching libraries like React Query (TanStack Query) or SWR for better handling of loading, caching, and errors.

*   **avoidParentChildCoupling**: Warns against coupling parent behavior or state to a child component via `useEffect` or `useLayoutEffect`. Suggests lifting shared logic or state up to the parent component.

*   **avoidEventHandler**: Flags `useEffect` or `useLayoutEffect` hooks that behave like event handlers. Instead, the event handler should be called directly.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the Beerware License. See the [LICENSE](LICENSE) file for details.