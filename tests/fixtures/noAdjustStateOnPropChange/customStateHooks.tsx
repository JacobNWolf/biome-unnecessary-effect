import { useEffect } from 'react';

declare function useStoredState<T>(key: string, initial: T): [T, (value: T) => void];
declare function usePanelState(): { setOpen: (value: boolean) => void };
declare function useSomething(): [boolean, (value: boolean) => void];
declare function track(value: boolean): void;

export function FirstRunHint({ selecting }: { selecting: boolean }) {
  const [seen, setSeen] = useStoredState('hint', false);
  useEffect(() => {
    if (selecting && !seen) setSeen(true); // expect: noAdjustStateOnPropChange
  }, [selecting, seen, setSeen]);
  return <button onClick={() => setSeen(false)}>{String(seen)}</button>;
}

export function AssistantWork({ a, b }: { a: boolean; b: boolean }) {
  const [open, setOpen] = useStoredState('work', false);
  useEffect(() => {
    if (a || b) setOpen(true); // expect: noAdjustStateOnPropChange
  }, [a, b]);
  return <button onClick={() => setOpen(false)}>{String(open)}</button>;
}

export function Shadowed({ selecting }: { selecting: boolean }) {
  const [seen, setSeen] = useStoredState('hint', false);
  useEffect(() => {
    const setSeen = track;
    if (selecting) setSeen(true); // expect: noEventHandler
  }, [selecting]);
  return <button onClick={() => setSeen(false)}>{String(seen)}</button>;
}

export function ObjectHook({ selecting }: { selecting: boolean }) {
  const { setOpen } = usePanelState();
  useEffect(() => {
    if (selecting) setOpen(true);
  }, [selecting]);
  return null;
}

export function OtherHook({ selecting }: { selecting: boolean }) {
  const [seen, setSeen] = useSomething();
  useEffect(() => {
    if (selecting) setSeen(true);
  }, [selecting]);
  return String(seen);
}
