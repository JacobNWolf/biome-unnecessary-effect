import { useCallback, useEffect, useRef, useState } from 'react';

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

// Literal assignments and mount-only effects are flags, not latest-value mirrors.
export function useMountFlag(initialValue: string) {
  const hasMountedRef = useRef(false);
  const initialRef = useRef('');
  useEffect(() => {
    hasMountedRef.current = true;
  }, []);
  useEffect(() => {
    initialRef.current = initialValue;
  }, []);
  useEffect(() => {
    if (hasMountedRef.current && initialRef.current) {
      console.log('ready');
    }
  }, [initialValue]);
}

declare function saveContent(draft: string): Promise<void>;

// Reading the latest ref after an await cannot be replaced with useEffectEvent.
export function useAutoSave(draft: string) {
  const latestDraftRef = useRef(draft);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  useEffect(() => {
    latestDraftRef.current = draft;
  }, [draft]);
  useEffect(() => {
    const id = window.setTimeout(async () => {
      await saveContent(draft);
      if (latestDraftRef.current === draft) setUnsavedChanges(false);
    }, 100);
    return () => window.clearTimeout(id);
  }, [draft]);
  return unsavedChanges;
}
