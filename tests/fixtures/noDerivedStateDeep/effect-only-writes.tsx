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

export function RenderScopeHelper({ count }: { count: number }) {
  const [doubled, setDoubled] = useState(0);
  const double = (value: number) => setDoubled(value * 2);
  const alias = setDoubled;

  useEffect(() => {
    double(count); // expect: noDerivedStateDeep
  }, [count]);

  useEffect(() => {
    alias(count); // expect: noDerivedStateDeep
  }, [count]);

  return doubled;
}

export function EditableHelper({ count }: { count: number }) {
  const [draft, setDraft] = useState(count);
  const update = (value: number) => setDraft(value);

  useEffect(() => {
    update(count);
  }, [count]);

  return <input value={draft} onChange={(event) => update(Number(event.target.value))} />;
}

export function RenamedEditable({ title }: { title: string }) {
  const [draft, setDraft] = useState(title);
  useFx(() => {
    setDraft(title);
  }, [title]);
  return <input value={draft} onChange={(event) => setDraft(event.target.value)} />;
}
