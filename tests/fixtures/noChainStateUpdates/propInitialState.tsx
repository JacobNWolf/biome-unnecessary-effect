import { useEffect, useState } from 'react';

export function PropInitialState({ initial }) {
  const [item, setItem] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true); // expect: noChainStateUpdates
  }, [item]);
  return [ready, setItem];
}
