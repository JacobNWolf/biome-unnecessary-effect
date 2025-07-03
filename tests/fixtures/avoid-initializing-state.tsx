import { useEffect, useState } from 'react';

export function InitializingStateComponent() {
  const [name, setName] = useState('');

  useEffect(() => {
    setName('test');
  }, []);

  return <div>{name}</div>;
}
