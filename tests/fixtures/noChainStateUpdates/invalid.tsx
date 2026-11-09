import { useEffect, useState } from 'react';

export function Game() {
  const [round] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  useEffect(() => {
    if (round > 10) { // expect: noEventHandler
      setIsGameOver(true); // expect: noChainStateUpdates
    }
  }, [round]);
  return isGameOver;
}
