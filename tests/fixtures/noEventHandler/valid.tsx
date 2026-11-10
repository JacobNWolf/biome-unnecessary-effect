import { useEffect, useRef, useState } from 'react';

export function Dialog({ isOpen }: { isOpen: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);
  return <dialog ref={ref} />;
}

export function Scroll({ onScroll }: { onScroll?: (y: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const handle = () => onScroll?.(element.scrollTop);
    element.addEventListener('scroll', handle);
    return () => element.removeEventListener('scroll', handle);
  }, [onScroll]);
  return <div ref={ref} />;
}

// One-time seeding from data that arrives after mount. The state rules report it.
export function Drafts({ flights }: { flights: string[] }) {
  const [drafts, setDrafts] = useState<string[]>([]);
  const initialized = useRef(false);
  useEffect(() => {
    if (flights.length > 0 && !initialized.current) {
      initialized.current = true;
      setDrafts(flights.map((flight) => flight.trim())); // expect: noDerivedState, noDerivedStateDeep
    }
  }, [flights]);
  return drafts;
}

export function Like({ fetched, likes }: { fetched: boolean; likes: string[] }) {
  const [count, setCount] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    if (fetched && !hasMounted) {
      setCount(likes.filter(Boolean).length); // expect: noDerivedState, noDerivedStateDeep
      setHasMounted(true); // expect: noAdjustStateOnPropChange
    }
  }, [fetched, hasMounted]);
  return count;
}

export function GuardedReset({ items }: { items: string[] }) {
  const [selection, setSelection] = useState<string | null>(null);
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (!items.length) return;
    setSelection(null); // expect: noAdjustStateOnPropChange
  }, [items]);
  return selection;
}
