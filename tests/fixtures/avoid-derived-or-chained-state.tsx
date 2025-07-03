import { useEffect, useState } from 'react';

export function DerivedStateComponent({ value }: { value: string }) {
  const [derived, setDerived] = useState('');

  useEffect(() => {
    setDerived(`derived: ${value}`);
  }, [value]);

  return <div>{derived}</div>;
}
