import { useEffect, useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setCount(count + 1); // expect: noSetStateInEffectWithoutDeps
    if (window.innerWidth !== width) setWidth(window.innerWidth);
  });
  return count + width;
}
