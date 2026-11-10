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

export function useCount(store: { read: () => number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(store.read()); // expect: noExternalStoreSubscription
    return () => setCount(0);
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
