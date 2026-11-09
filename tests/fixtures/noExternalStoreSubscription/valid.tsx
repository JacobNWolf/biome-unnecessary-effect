import { useEffect, useState, useSyncExternalStore } from 'react';

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
