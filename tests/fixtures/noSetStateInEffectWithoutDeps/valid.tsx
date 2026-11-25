import { useEffect, useLayoutEffect, useRef, useState } from 'react';

declare function measure(node: HTMLDivElement | null): { width: number } | null;

export function MeasuredBox() {
  const boxRef = useRef<HTMLDivElement>(null);
  const measuredKey = useRef('');
  const [measured, setMeasured] = useState<{ width: number } | null>(null);

  useLayoutEffect(() => {
    const next = measure(boxRef.current);
    const key = JSON.stringify(next);
    if (key === measuredKey.current) return;
    measuredKey.current = key;
    setMeasured(next);
  });

  return <div ref={boxRef}>{measured?.width}</div>;
}

export function GuardedBlockReturn() {
  const lastValue = useRef(0);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const next = window.innerWidth;
    if (next === lastValue.current) {
      return;
    }
    lastValue.current = next;
    setValue(next);
  });

  return value;
}
