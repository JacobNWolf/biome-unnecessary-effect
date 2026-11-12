import { useContext, useEffect, useState } from 'react';

type Callbacks = { onChange: (value: number) => void };
declare const CallbackContext: React.Context<Callbacks>;
declare function onChange(value: number): void;

export function PropPropertyKey(props: Callbacks) {
  const [count] = useState(0);
  const { onChange: handler } = props;
  useEffect(() => {
    onChange(count);
  }, [count]);
  return handler;
}

export function PropDefault(props: { handler?: (value: number) => void }) {
  const [count] = useState(0);
  const { handler = onChange } = props;
  useEffect(() => {
    onChange(count);
  }, [count]);
  return handler;
}

export function ContextPropertyKey() {
  const [count] = useState(0);
  const { onChange: handler } = useContext(CallbackContext);
  useEffect(() => {
    onChange(count);
  }, [count]);
  return handler;
}

export function BoundProp(props: Callbacks) {
  const [count] = useState(0);
  const { onChange: handler = onChange } = props;
  useEffect(() => {
    handler(count); // expect: noPassLiveStateToParent
  }, [count, handler]);
}

export function BoundContext() {
  const [count] = useState(0);
  const { onChange: handler = onChange } = useContext(CallbackContext);
  useEffect(() => {
    handler(count); // expect: noPassLiveStateToParent
  }, [count, handler]);
}

export function NestedBinding(props: { callbacks: Callbacks }) {
  const [count] = useState(0);
  const { callbacks: { onChange: handler } } = props;
  useEffect(() => {
    handler(count); // expect: noPassLiveStateToParent
  }, [count, handler]);
}
