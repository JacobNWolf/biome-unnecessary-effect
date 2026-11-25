import { useEffect, useRef, useState } from 'react';

export function BrowserSynchronization({ active, value }: { active: boolean; value: string }) {
  const target = useRef<HTMLElement | null>(null);
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (active) document.getElementById(value)?.scrollIntoView();
    setLabel(value);
  }, [active, value]);
  useEffect(() => {
    if (active) window.location.reload();
  }, [active]);
  useEffect(() => {
    if (document.referrer && active) console.log('arrived');
  }, [active]);
  useEffect(() => {
    if (document?.referrer?.includes('checkout') && active) {
      console.log('arrived');
    }
  }, [active]);
  useEffect(() => {
    target.current = document.getElementById('target');
    setLabel('ready');
  }, []);
  useEffect(() => {
    cancelAnimationFrame(Number(value));
    setLabel(value);
  }, [value]);
  return label;
}

function readStoredValue(key: string) {
  return window.localStorage.getItem(key) ?? '';
}

export function StoredValue({ storageKey }: { storageKey: string }) {
  const [value, setValue] = useState('');
  useEffect(() => {
    setValue(readStoredValue(storageKey)); // expect: noDerivedState
  }, [storageKey]);
  return value;
}

export function RefWrites() {
  const ref = useRef(0);
  const [value, setValue] = useState(0);
  useEffect(() => {
    ref.current = 1;
    setValue(1);
  }, []);
  return value;
}

export function ImperativeBrowserCalls({ element }: { element: HTMLElement | null }) {
  useEffect(() => {
    if (!element) return;
    element.scrollIntoView();
  }, [element]);
  useEffect(() => {
    if (element) {
      element.scrollTo(0, 0);
      element.focus();
    }
  }, [element]);
}
