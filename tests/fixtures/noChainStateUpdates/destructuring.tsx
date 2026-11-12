import { useContext, useEffect, useState } from 'react';

declare const CounterContext: React.Context<{ count: number; initial: number }>;

export function ContextPropertyKey() {
  const [count] = useState(0);
  const [ready, setReady] = useState(false);
  const { count: contextCount } = useContext(CounterContext);
  useEffect(() => {
    setReady(true); // expect: noChainStateUpdates
  }, [count]);
  return ready && contextCount;
}

export function ContextDefault() {
  const [count] = useState(0);
  const [ready, setReady] = useState(false);
  const { initial = count } = useContext(CounterContext);
  useEffect(() => {
    setReady(true); // expect: noChainStateUpdates
  }, [count]);
  return ready && initial;
}

export function ContextDefaultBinding() {
  const [count] = useState(0);
  const [ready, setReady] = useState(false);
  const { initial = ((count: number) => count)(0) } = useContext(CounterContext);
  useEffect(() => {
    setReady(true); // expect: noChainStateUpdates
  }, [count]);
  return ready && initial;
}

export function ContextComputedKey() {
  const [count] = useState(0);
  const [ready, setReady] = useState(false);
  const { [((count: number) => count)(0)]: contextCount } = useContext(CounterContext);
  useEffect(() => {
    setReady(true); // expect: noChainStateUpdates
  }, [count]);
  return ready && contextCount;
}

export function ContextBoundDefault() {
  const [ready, setReady] = useState(false);
  const { count: contextCount = 0 } = useContext(CounterContext);
  useEffect(() => {
    setReady(contextCount > 0); // expect: noDerivedState, noDerivedStateDeep
  }, [contextCount]);
  return ready;
}
