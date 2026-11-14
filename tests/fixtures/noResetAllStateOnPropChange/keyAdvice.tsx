import { useEffect, useState } from 'react';

export function ObjectReset({ data }: { data: object }) {
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);
  useEffect(() => { // expect: noResetAllStateOnPropChange
    setName(''); // expect: noAdjustStateOnPropChange
    setCount(0); // expect: noAdjustStateOnPropChange
  }, [data]);
  return name + count;
}

export function BooleanReset({ isSynced }: { isSynced: boolean }) {
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);
  useEffect(() => {
    setName(''); // expect: noAdjustStateOnPropChange
    setCount(0); // expect: noAdjustStateOnPropChange
  }, [isSynced]);
  return name + count;
}

export function CleanupReset({ id }: { id: string }) {
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);
  useEffect(() => {
    setName(''); // expect: noAdjustStateOnPropChange
    setCount(0); // expect: noAdjustStateOnPropChange
    return () => console.log('disposed');
  }, [id]);
  return name + count;
}
