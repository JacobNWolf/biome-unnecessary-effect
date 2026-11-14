import { useEffect, useMemo, useState } from 'react';

declare function useSomeAPI(): unknown;

export function Counter({ onCount }: { onCount: (count: number) => void }) {
  const [count] = useState(0);
  useEffect(() => {
    onCount(count); // expect: noPassLiveStateToParent
  }, [count, onCount]);
  return null;
}

export function Memoized({ onData }: { onData: (data: unknown) => void }) {
  const data = useMemo(() => ({ ok: true }), []);
  useEffect(() => {
    onData(data);
  }, [data, onData]);
  return null;
}

export function LocalCallback({ onDone }: { onDone: () => void }) {
  const data = useSomeAPI();
  function log(value: unknown) {
    console.log(value);
  }
  useEffect(() => {
    log(data);
    onDone();
  }, [data, onDone]);
  return null;
}

export function ForwardProp({ value, onValue }: { value: string; onValue: (value: string) => void }) {
  useEffect(() => {
    onValue(value);
  }, [onValue, value]);
  return null;
}

export function ReadsProp({ offset }: { offset: number }) {
  const data = useSomeAPI();
  const log = (value: unknown) => console.log(value, offset);
  useEffect(() => {
    log(data);
  }, [data, log]);
}

export function LocalSearch({ onFetched }) {
 const [query, setQuery] = useState("");
 const results = useSearch(query);
 const top = results[0];
 useEffect(() => {
  onFetched(top);
 }, [top, onFetched]);
}

export function HookzData({ onFetched }) {
  const data = useSomeAPI();
  useCustomCompareEffect(() => {
    onFetched(data);
  }, [data, onFetched], cmp, useLayoutEffect);
}
