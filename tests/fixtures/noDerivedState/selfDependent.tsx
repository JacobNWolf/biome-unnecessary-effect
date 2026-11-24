import { useEffect, useState } from 'react';

export function Accumulator({ next }: { next: string[] }) {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    setItems((previous) => [...previous, ...next]);
  }, [next]);
  return items;
}

export function Pagination() {
  const [page, setPage] = useState(0);
  const [reset, setReset] = useState(true);
  useEffect(() => {
    if (reset) setReset(false); // expect: noChainStateUpdates
    setPage(page + 1);
  }, [reset, page]);
  return page;
}

export function SelfReset() {
  const [flag, setFlag] = useState(true);
  useEffect(() => {
    if (flag) setFlag(false);
  }, [flag]);
  return flag;
}

export function OtherDependency() {
  const [flag, setFlag] = useState(true);
  const [other] = useState(0);
  useEffect(() => {
    setFlag(false); // expect: noChainStateUpdates
  }, [flag, other]);
  return flag;
}

declare function clearStoredValue(): void;

export function ExternalWork() {
  const [ready] = useState(false);
  const [value, setValue] = useState('');
  useEffect(() => {
    clearStoredValue();
    setValue('ready');
  }, [ready]);
  return value;
}

export function AliasSelfReset() {
  const [flag, setFlag] = useState(true);
  const active = flag;
  useEffect(() => {
    if (active) setFlag(false);
  }, [active]);
  return flag;
}

export function NamedUpdater({ count }: { count: number }) {
  const [total, setTotal] = useState(0);
  const increment = (previous: number) => previous + count;
  useEffect(() => {
    setTotal(increment);
  }, [count]);
  return total;
}

export function ObjectWithCallback({ count }: { count: number }) {
  const [state, setState] = useState<{ value: number; onClick: () => void }>({ value: 0, onClick: () => {} });
  useEffect(() => {
    setState({ value: count, onClick: () => {} }); // expect: noDerivedState, noDerivedStateDeep
  }, [count]);
  return state;
}
