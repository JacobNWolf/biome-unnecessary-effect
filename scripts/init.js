#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';

const PACKAGE = '@jacobwolf/biome-unnecessary-effect';
const MIN_BIOME = '2.4.5';
const MANIFEST_BIOME = '2.6.0';

const fail = (message) => {
  console.error(`biome-unnecessary-effect: ${message}`);
  process.exit(1);
};

const atLeast = (version, min) => {
  const a = version.split(/[.-]/).map(Number);
  const b = min.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return true;
};

if (process.argv[2] !== 'init') fail(`unknown command. Usage: npx ${PACKAGE} init`);

const cwd = process.cwd();
const require = createRequire(join(cwd, 'package.json'));
let biomeVersion;
try {
  biomeVersion = require('@biomejs/biome/package.json').version;
} catch {
  fail('@biomejs/biome is not installed in this project. Install it first, e.g. `npm install -D @biomejs/biome`.');
}
if (!atLeast(biomeVersion, MIN_BIOME))
  fail(`Biome ${biomeVersion} is too old; this plugin needs ${MIN_BIOME} or newer.`);

const manifest = JSON.parse(readFileSync(new URL('../biome-manifest.json', import.meta.url), 'utf8'));
const configPath =
  ['biome.json', 'biome.jsonc'].map((name) => join(cwd, name)).find(existsSync) ?? join(cwd, 'biome.json');

// Biome 2.6+ resolves the preset from the package manifest. Older versions need a path to each rule file,
// relative to the config file.
let entries = [`${PACKAGE}/presets/recommended`];
if (!atLeast(biomeVersion, MANIFEST_BIOME)) {
  const packagePath = require.resolve
    .paths(PACKAGE)
    .map((path) => join(path, PACKAGE))
    .find(existsSync);
  if (!packagePath) fail(`${PACKAGE} is not installed in this project. Install it first.`);
  const packageDir = relative(dirname(configPath), packagePath).split('\\').join('/');
  entries = manifest.plugins.presets.recommended.map((rule) => `./${packageDir}/grit/rules/${rule}.grit`);
}

const text = existsSync(configPath) ? readFileSync(configPath, 'utf8') : '{}\n';
let config;
try {
  config = JSON.parse(text);
} catch {
  fail(
    `couldn't parse ${relative(cwd, configPath)} as plain JSON (it may contain comments). ` +
      `Add these entries to its "plugins" array manually:\n${JSON.stringify(entries, null, 2)}`,
  );
}
if (config.plugins !== undefined && !Array.isArray(config.plugins))
  fail('"plugins" in your Biome config is not an array.');

const isOurs = (entry) => {
  const path = typeof entry === 'string' ? entry : entry?.path;
  if (typeof path !== 'string') return false;
  const normalized = path.replaceAll('\\', '/');
  const packagePath = `node_modules/${PACKAGE}/`;
  return (
    normalized === `${PACKAGE}/presets/recommended` ||
    normalized.startsWith(packagePath) ||
    normalized.includes(`/${packagePath}`)
  );
};
const kept = (config.plugins ?? []).filter((entry) => !isOurs(entry));
const plugins = [...kept, ...entries];

if (JSON.stringify(plugins) === JSON.stringify(config.plugins)) {
  console.log(`${relative(cwd, configPath)} is already configured for Biome ${biomeVersion}.`);
  process.exit(0);
}

const indent = text.match(/^[ \t]+/m)?.[0] ?? '  ';
writeFileSync(configPath, `${JSON.stringify({ ...config, plugins }, null, indent)}\n`);
console.log(`Added ${PACKAGE} to ${relative(cwd, configPath)} for Biome ${biomeVersion}:`);
for (const entry of entries) console.log(`  ${entry}`);
