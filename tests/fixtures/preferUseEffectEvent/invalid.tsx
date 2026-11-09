import { useEffect, useLayoutEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef(callback);
  useLayoutEffect(() => {
    savedCallback.current = callback; // expect: preferUseEffectEvent
  });
  useEffect(() => {
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
