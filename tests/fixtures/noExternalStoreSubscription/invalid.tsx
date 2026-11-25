import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function updateState() {
      setIsOnline(navigator.onLine);
    }
    updateState(); // expect: noExternalStoreSubscription
    window.addEventListener('online', updateState);
    window.addEventListener('offline', updateState);
    return () => {
      window.removeEventListener('online', updateState);
      window.removeEventListener('offline', updateState);
    };
  }, []);
  return isOnline;
}

export function useCount(store: { read: () => number; subscribe: (callback: (value: number) => void) => () => void }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(store.read()); // expect: noExternalStoreSubscription
    const unsubscribe = store.subscribe(setCount);
    return () => { unsubscribe(); setCount(0); };
  }, []);
  return count;
}

declare const editor: {
  on(event: string, cb: () => void): void;
  off(event: string, cb: () => void): void;
  storage: { anchors: string[] };
};

// An editor emitter plus a read of editor state is a store.
export function useAnchors() {
  const [anchors, setAnchors] = useState<string[]>([]);
  useEffect(() => {
    const handler = () => setAnchors(editor.storage.anchors);
    editor.on('update', handler);
    handler(); // expect: noExternalStoreSubscription
    return () => editor.off('update', handler);
  }, []);
  return anchors;
}

export function useAliasedCount(store: { read: () => number; subscribe: (callback: (value: number) => void) => () => void }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = setCount;
    update(store.read()); // expect: noExternalStoreSubscription
    const unsubscribe = store.subscribe(setCount);
    return () => { unsubscribe(); setCount(0); };
  }, []);
  return count;
}

declare function watchChanges(callback: (value: number) => void): () => void;

export function useCustomSubscription() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(1); // expect: noExternalStoreSubscription
    const stop = watchChanges(setCount);
    return () => { stop(); setCount(0); };
  }, []);
  return count;
}

export function useOnlineStatusTuple() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function updateState() {
      setIsOnline(navigator.onLine);
    }
    updateState(); // expect: noExternalStoreSubscription
    window.addEventListener('online', updateState);
    return () => window.removeEventListener('online', updateState);
  }, []);
  return [isOnline, setIsOnline] as const;
}

declare function StoreChild(props: { setV: number; value: number }): null;
declare const simpleStore: { get(): number };

export function NonReferenceSetterNames() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const update = () => setV(simpleStore.get());
    update(); // expect: noExternalStoreSubscription
    window.addEventListener('focus', update);
    return () => window.removeEventListener('focus', update);
  }, []);
  const obj = { setV: 1 };
  const fromWindow = (window as { setV?: number }).setV ?? obj.setV;
  return <StoreChild setV={fromWindow} value={v} />;
}
