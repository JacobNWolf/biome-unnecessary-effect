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
    setCount(store.read()); // expect: noExternalStoreSubscription, noInitializeState
    return () => setCount(0);
  }, []);
  return count;
}
