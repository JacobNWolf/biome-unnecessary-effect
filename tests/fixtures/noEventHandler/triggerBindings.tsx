import { useCallback, useEffect, useState } from 'react';

export function LocalMatch({ items, notify }: { items: string[]; notify: (value: string) => void }) {
  useEffect(() => {
    const match = items.find(Boolean);
    if (match) {
      notify(match);
    }
  }, [items, notify]);
}

export function TypeName({ src }: { src: string }) {
  const kind = typeof src;
  useEffect(() => {
    if (typeof kind === 'string') {
      console.log(kind);
    }
  }, [kind]);
}

declare function useData(id: string): unknown;

export function LocalCallback({ id, onData }: { id: string; onData: (data: unknown) => void }) {
  const data = useData(id);
  const publish = useCallback(() => onData(data), [onData, data]);
  useEffect(() => {
    publish(data);
  }, [data, publish]);
}

export function GuardedAdjustment({ features, isOpen }: { features: string[]; isOpen: boolean }) {
  const [value, setValue] = useState('');
  useEffect(() => {
    if (!isOpen) {
      setValue(''); // expect: noAdjustStateOnPropChange
    }
  }, [features, isOpen]);
  return value;
}

export function MountDraft({ title }: { title: string }) {
  const [draft, setDraft] = useState('');
  useEffect(() => {
    setDraft(title); // expect: noInitializeState
  }, []);
  return <input value={draft} onChange={(event) => setDraft(event.target.value)} />;
}
