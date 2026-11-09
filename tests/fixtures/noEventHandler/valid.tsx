import { useEffect, useRef } from 'react';

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
