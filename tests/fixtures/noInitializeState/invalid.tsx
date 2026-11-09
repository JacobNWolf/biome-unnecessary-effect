import * as React from 'react';
import { useEffect, useState } from 'react';
import { useMount } from 'react-use';

export function Initialize() {
  const [name, setName] = useState('');
  const [label, setLabel] = useState<string | null>(null);
  const [count, setCount] = React.useState(0);
  useEffect(() => {
    setName('test'); // expect: noInitializeState
    setLabel('x'); // expect: noInitializeState
  }, []);
  React.useEffect(() => setCount(1), []); // expect: noInitializeState
  useEffect(() => {
    setName('setter-only deps'); // expect: noInitializeState
  }, [setName]);
  useMount(() => {
    setName('mounted'); // expect: noInitializeState
  });
  return `${name}${label}${count}`;
}
