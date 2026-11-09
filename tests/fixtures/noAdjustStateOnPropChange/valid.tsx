import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function PropDriven({ items }: { items: string[] }) {
  const [selection, setSelection] = useState<string | null>(null);
  useLayoutEffect(() => {
    setSelection(null);
  }, [items]);
  return selection;
}

export function EventHandler({ items }: { items: string[] }) {
  const [selection, setSelection] = useState<string | null>(null);
  const handleReset = () => setSelection(null);
  return <button onClick={handleReset}>{items.length}</button>;
}

export function RefOnly({ items }: { items: string[] }) {
  const previous = useRef(items);
  useLayoutEffect(() => {
    previous.current = items; // expect: preferUseEffectEvent
  }, [items]);
  return previous.current.length;
}

export function PropInArgument({ items }: { items: string[] }) {
  const [selection, setSelection] = useState<string | null>(null);
  const first = items[0] ?? null;
  useEffect(() => {
    setSelection(first); // expect: noDerivedState, noDerivedStateDeep
  }, [items]);
  return selection;
}
