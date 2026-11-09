import { useEffect, useState } from 'react';

export function Game() {
  const [round] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  useEffect(() => { // expect: noEventHandler
    if (round > 10) {
      setIsGameOver(true); // expect: noChainStateUpdates
    }
  }, [round]);
  return isGameOver;
}
