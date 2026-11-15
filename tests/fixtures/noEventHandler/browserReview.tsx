import { useEffect, useRef, useState } from 'react';

export function FocusOptions({ active, target }: { active: boolean; target: HTMLElement }) {
  useEffect(() => {
    if (active) {
      target.focus({ preventScroll: true });
    }
  }, [active, target]);
}

export function DocumentProp({ document }: { document: { name: string; ready: boolean } }) {
  const [name, setName] = useState('');
  useEffect(() => {
    setName(document.name); // expect: noInitializeState
  }, []);
  useEffect(() => {
    setName(document.name); // expect: noDerivedState, noDerivedStateDeep
  }, [document]);
  useEffect(() => {
    if (document.ready) { // expect: noEventHandler
      console.log(document.name);
    }
  }, [document]);
  return name;
}

export function LocalDocument() {
  const document = { name: 'draft' };
  const [name, setName] = useState('');
  useEffect(() => {
    setName(document.name); // expect: noInitializeState
  }, []);
  return name;
}

export function EffectLocalDocument() {
  const [name, setName] = useState('');
  useEffect(() => {
    const document = { name: 'draft' };
    setName(document.name); // expect: noInitializeState
  }, []);
  return name;
}

export function BlockLocalDocument() {
  const [name, setName] = useState('');
  useEffect(() => {
    if (name === '') {
      const document = { name: 'draft' };
      setName(document.name); // expect: noInitializeState
    }
  }, []);
  return name;
}

export function UnrelatedShadow({ active }: { active: boolean }) {
  const describe = (document: { name: string }) => document.name;
  if (!active) {
    const document = { name: 'draft' };
    console.log(document.name);
  }
  useEffect(() => {
    if (active) {
      console.log(document.title);
    }
  }, [active]);
  return describe({ name: 'draft' });
}

function readStored(key: string) {
  return JSON.parse(localStorage.getItem(key) ?? 'null');
}

export function ParsedStorage({ storageKey }: { storageKey: string }) {
  const [stored, setStored] = useState<unknown>(null);
  useEffect(() => {
    setStored(readStored(storageKey)); // expect: noDerivedState
  }, [storageKey]);
  return String(stored);
}

export function RefHelper({ value }: { value: string }) {
  const last = useRef('');
  const [saved, setSaved] = useState('');
  const remember = () => {
    last.current = value;
  };
  useEffect(() => {
    remember();
    setSaved(value); // expect: noDerivedState
  }, [value]);
  return saved;
}

export function AsyncRefHelper({ value }: { value: string }) {
  const last = useRef('');
  const [saved, setSaved] = useState('');
  const remember = async () => {
    last.current = value;
  };
  useEffect(() => {
    void remember();
    setSaved(value); // expect: noDerivedState, noDerivedStateDeep
  }, [value]);
  return saved;
}
