import { useEffect, useState } from 'react';

declare function load(query: string): Promise<string>;

export function Search({ query }: { query: string }) {
  const [result, setResult] = useState('');
  const [label, setLabel] = useState('');

  // The setter runs after `await`, so it isn't synchronous derived state.
  useEffect(() => {
    async function run() {
      setResult(await load(query));
    }
    run();
  }, [query]);

  // Effects with a cleanup synchronize with something external.
  useEffect(() => {
    setLabel(query);
    const id = setInterval(() => setLabel(`${query}!`), 1000);
    return () => clearInterval(id);
  }, [query]);

  // A local function that shadows the setter's name isn't a setter. GritQL matches by name, so it misreports this.
  useEffect(() => {
    const setResult = (value: string) => console.log(value);
    setResult(query); // expect: noDerivedState
  }, [query]);

  return result + label;
}

export const Errors = ({ url }: { url: string }) => {
  const [err, setErr] = useState<unknown>();
  const [x, setX] = useState(0);
  useEffect(() => {
    try {
      console.log(url);
    } catch (e) {
      setErr(e); // expect: noAdjustStateOnPropChange
    }
    function apply(v: number) {
      setX(v);
    }
    apply(1);
  }, [url]);
  return String(err) + x;
};
