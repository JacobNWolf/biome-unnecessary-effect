import React, { useEffect, useEffect as useFx, useLayoutEffect as useLayout, useState } from 'react';

declare function useMount(callback: () => void): void;

export function EffectOnlyWrites({ title }: { title: string }) {
  const [label, setLabel] = React.useState<string>('');
  useEffect(() => {
    setLabel(title); // expect: noDerivedState, noDerivedStateDeep
  }, [title]);
  React.useLayoutEffect(() => {
    setLabel('layout');
  }, []);
  React.useInsertionEffect(() => {
    setLabel('insertion');
  }, []);
  useMount(() => {
    setLabel('mounted'); // expect: noInitializeState
  });
  useEffect(async () => { // expect: noAsyncEffectCallback
    setLabel('async');
  }, []);
  useEffect(() => {
    setLabel('no deps'); // expect: noSetStateInEffectWithoutDeps
  });
  return label;
}

export function RenamedEffects({ title }: { title: string }) {
  const [label, setLabel] = useState('');
  useFx(() => {
    setLabel(title); // expect: noDerivedStateDeep
  }, [title]);
  useLayout(() => {
    setLabel('layout');
  }, []);
  return label;
}

export function RenamedEditable({ title }: { title: string }) {
  const [draft, setDraft] = useState(title);
  useFx(() => {
    setDraft(title);
  }, [title]);
  return <input value={draft} onChange={(event) => setDraft(event.target.value)} />;
}
