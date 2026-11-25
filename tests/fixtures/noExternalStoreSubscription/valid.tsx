import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange);
  return () => window.removeEventListener('online', onChange);
}

export function useEventCount() {
  const [events, setEvents] = useState(0);
  useEffect(() => {
    function onEvent() {
      setEvents((value) => value + 1);
    }
    window.addEventListener('online', onEvent);
    return () => window.removeEventListener('online', onEvent);
  }, []);
  return events;
}

export function useCount(store: { read: () => number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setCount(store.read()), 100);
    return () => {
      clearTimeout(id);
      setCount(0);
    };
  }, []);
  return count;
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, () => navigator.onLine);
}

export function useInitial(store: { read: () => number }) {
  useEffect(() => {
    const initial = store.read();
    console.log(initial);
    return () => {};
  }, [store]);
}

// Layout measurement needs the committed DOM node.
export function HasScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  useEffect(() => {
    const element = ref.current;
    const check = () => {
      if (element) setHasScroll(element.scrollWidth > element.clientWidth);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return <div ref={ref}>{String(hasScroll)}</div>;
}

declare const editor: {
  on(event: string, cb: () => void): void;
  off(event: string, cb: () => void): void;
  doc: string;
};

// The effect re-subscribes when its own state changes, so it isn't reading a store.
export function Confirmation() {
  const [moved, setMoved] = useState<string>();
  useEffect(() => {
    if (!moved) return;
    const clear = () => {
      if (moved !== editor.doc) setMoved(undefined);
    };
    editor.on('update', clear);
    clear();
    return () => editor.off('update', clear);
  }, [moved]);
  return moved;
}

export function useLetAliasedCount(store: { read: () => number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let update = setCount;
    update(store.read());
    return () => setCount(0);
  }, []);
  return count;
}

// Editable local UI state updated from user events is not a read-only external store.
export function Inspector({ active }: { active: boolean }) {
  const [selected, setSelected] = useState<Element | null>(null);
  useEffect(() => {
    if (!active) {
      setSelected(null);
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);
  return (
    <button type="button" onClick={() => setSelected(document.body)}>
      {selected?.tagName}
    </button>
  );
}

declare const externalStore: { get(): number };

// Component-level setter alias in effect, with original setter called in an event handler.
export function AliasedEditableState() {
  const [v, setV] = useState(0);
  const set = setV;
  useEffect(() => {
    const update = () => set(externalStore.get());
    update();
    window.addEventListener('focus', update);
    return () => window.removeEventListener('focus', update);
  }, []);
  return (
    <button type="button" onClick={() => setV(0)}>
      {v}
    </button>
  );
}
