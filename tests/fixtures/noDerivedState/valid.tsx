import { useEffect, useState } from 'react';

declare const socket: { on: (event: string, cb: (message: string) => void) => () => void };

export function Subscribed({ room }: { room: string }) {
  const [message, setMessage] = useState('');
  useEffect(() => socket.on(room, (next) => setMessage(next)), [room]);
  useEffect(() => {
    const id = setInterval(() => setMessage(room), 1000);
    return () => clearInterval(id);
  }, [room]);
  return message;
}

export function LetAlias() {
  const [data, setData] = useState();
  let set = setData;
  useEffect(() => {
    set(data); // expect: noDerivedStateDeep
  }, [data]);
}

export function Editor({ value }: { value: string }) {
  const [draft, setDraft] = useState('');
  const updateDraft = setDraft;

  useEffect(() => {
    updateDraft(value); // expect: noAdjustStateOnPropChange
  }, [value]);

  return <input value={draft} onChange={(event) => setDraft(event.target.value)} />;
}

export function LocalArray() {
 const [result, setResult] = useState();
 useEffect(() => {
  const [, second] = [a, b];
  setResult(second); // expect: noInitializeState
 }, []);
 return result;
}

export function ObjectFromCall({ posts }) {
  const [result, setResult] = useState();
  useEffect(() => {
    const { second } = selectPosts(posts);
    setResult(second); // expect: noAdjustStateOnPropChange
  }, [posts]);
  return result;
}

export function ArrayDefault({ posts }) {
  const [result, setResult] = useState();
  useEffect(() => {
    const [first = fallback] = posts;
    setResult(fallback); // expect: noAdjustStateOnPropChange
  }, [posts]);
  return result;
}

export function HookzDerived({ value }) {
  const [result, setResult] = useState('');
  useCustomCompareEffect(() => {
    setResult(value); // expect: noDerivedStateDeep
  }, [value], cmp, useLayoutEffect);
  return result;
}

export function HelperAlsoUsedInHandler({ value }) {
  const [result, setResult] = useState('');
  const apply = () => setResult(value);
  useEffect(() => {
    apply();
  }, [value]);
  return <button onClick={() => apply()}>{result}</button>;
}

export function AsyncHelper({ value }) {
  const [result, setResult] = useState('');
  const apply = async () => setResult(value);
  useEffect(() => {
    apply();
  }, [value]);
  return result;
}

export function LetHelper({ value }) {
  const [result, setResult] = useState('');
  let apply = () => setResult(value);
  useEffect(() => {
    apply(); // expect: noDerivedStateDeep
  }, [value]);
  return result;
}

export function MountHelper({ value }) {
  const [result, setResult] = useState('');
  const apply = () => setResult(value);
  useEffect(() => {
    apply();
  }, []);
  return result;
}

export function HelperWithLocalArguments() {
  const [result, setResult] = useState('');
  const local = 'fixed';
  const apply = (value) => setResult(value);
  useEffect(() => {
    apply(local);
  }, [local]);
  return result;
}

export function ComponentHelper({ value }) {
  const [result, setResult] = useState('');
  function apply() {
    setResult(value);
  }
  useEffect(() => {
    apply(); // expect: noDerivedStateDeep
  }, [value]);
  return result;
}

export function SetterWrapper({ value }) {
  const [result, setResult] = useState('');
  const set = (next) => setResult(next);
  useEffect(() => {
    set(value); // expect: noDerivedStateDeep
  }, [value]);
  return result;
}

export function ReferencedHelper({ value }) {
  const [result, setResult] = useState('');
  function apply() {
    setResult(value); // expect: noDerivedStateDeep
  }
  useEffect(apply, [value]);
  return result;
}

export function HelperReadingLocalState() {
  const [source] = useState('');
  const [result, setResult] = useState('');
  function apply() {
    const next = source.toUpperCase();
    setResult(next);
  }
  useEffect(() => {
    apply(); // expect: noDerivedStateDeep
  }, [source]);
  return result;
}
