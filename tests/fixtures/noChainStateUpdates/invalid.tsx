import { useEffect, useState } from 'react';

export function Game() {
  const [round] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  useEffect(() => {
    if (round > 10) {
      setIsGameOver(true); // expect: noChainStateUpdates
    }
  }, [round]);
  return isGameOver;
}

export function Liked({ fetched }: { fetched: boolean }) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    if (fetched && !hasMounted) setHasMounted(true); // expect: noAdjustStateOnPropChange
  }, [fetched, hasMounted]);
  return hasMounted;
}
