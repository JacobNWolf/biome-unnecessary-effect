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

export function SiblingLoopShadow() {
  const [name, setName] = useState('');
  for (const document of [{ title: 'draft' }]) {
    console.log(document.title);
  }
  useEffect(() => {
    for (const document of [{ title: 'draft' }]) {
      console.log(document.title);
    }
    for (const document in { draft: true }) {
      console.log(document.length);
    }
    for (let document = 0; document < 1; document++) {
      console.log(document);
    }
    setName(document.title);
  }, []);
  return name;
}

export function LoopLocalDocument() {
  const [name, setName] = useState('');
  useEffect(() => {
    for (const document of [{ title: 'draft' }]) {
      setName(document.title); // expect: noInitializeState
    }
    for (const document in { draft: true }) {
      setName(document); // expect: noInitializeState
    }
    for (let document = 0; document < 1; document++) {
      setName(String(document)); // expect: noInitializeState
    }
  }, []);
  return name;
}

export function FunctionScopedLoopDocument() {
  const [name, setName] = useState('');
  useEffect(() => {
    for (var document of [{ title: 'draft' }]) {
      console.log(document.title);
    }
    setName(document.title); // expect: noInitializeState
  }, []);
  return name;
}

export function NestedDocumentProp(props: { active: boolean; document: { title: string } }) {
  useEffect(() => {
    if (props.active) { // expect: noEventHandler
      console.log(props.document.title);
    }
  }, [props]);
}

export function DocumentWrite({ value }: { value: string }) {
  const [name, setName] = useState('');
  useEffect(() => {
    document.title = value;
    setName(value);
  }, [value]);
  return name;
}

export function ShadowedDocumentWrite({ value, document }: { value: string; document: { title: string } }) {
  const [name, setName] = useState('');
  useEffect(() => {
    document.title = value;
    setName(value); // expect: noDerivedState, noDerivedStateDeep
  }, [value, document]);
  return name;
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
