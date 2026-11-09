import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const START = '// prelude:start';
const END = '// prelude:end';
const rulesDir = new URL('../grit/rules/', import.meta.url);
const prelude = readFileSync(new URL('../grit/prelude.grit', import.meta.url), 'utf8').trim();

for (const file of readdirSync(rulesDir).filter((name) => name.endsWith('.grit'))) {
  const url = new URL(file, rulesDir);
  const text = readFileSync(url, 'utf8');

  const start = text.indexOf(START);
  const end = text.indexOf(END);

  if (start === -1 || end === -1) throw new Error(`${file} is missing the prelude markers`);

  writeFileSync(url, text.slice(0, start) + prelude + text.slice(end + END.length));
}
