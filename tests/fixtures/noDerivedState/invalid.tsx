import { useEffect, useState } from 'react';

export function DerivedStateComponent({ value }: { value: string }) {
  const [derived, setDerived] = useState('');

  useEffect(() => { // expect: noDerivedState
    setDerived(`derived: ${value}`);
  }, [value]);

  return <div>{derived}</div>;
}
