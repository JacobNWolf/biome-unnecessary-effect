import { useCallback, useEffect, useRef } from 'react';

// The ref escapes the hook, so callers may read it from event handlers.
export function useStateRef<S>(state: S) {
  const ref = useRef(state);
  useEffect(() => {
    ref.current = state;
  }, [state]);
  return ref;
}

// An Effect Event can't be called from an event handler.
export function useSave(data: string, save: (data: string) => void) {
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  return useCallback(() => save(dataRef.current), [save]);
}
