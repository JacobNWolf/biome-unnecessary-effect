import { useEffect, useState } from 'react';

export function ObserverConstruction({ value }: { value: string }) {
  const [saved, setSaved] = useState('');
  useEffect(() => {
    new ResizeObserver(() => {});
    setSaved(value);
  }, [value]);
  useEffect(() => {
    new IntersectionObserver(() => {}, { threshold: 0.5 });
    setSaved(value);
  }, [value]);
  useEffect(() => {
    new MutationObserver(() => {});
    setSaved(value);
  }, [value]);
  return saved;
}

export function ObserverHelpers({ value }: { value: string }) {
  const [saved, setSaved] = useState('');
  const resize = () => new ResizeObserver(() => {});
  function intersect() {
    return new IntersectionObserver(() => {});
  }
  const mutate = () => new MutationObserver(() => {});
  useEffect(() => {
    resize();
    setSaved(value); // expect: noDerivedState
  }, [value]);
  useEffect(() => {
    intersect();
    setSaved(value); // expect: noDerivedState
  }, [value]);
  useEffect(() => {
    mutate();
    setSaved(value); // expect: noDerivedState
  }, [value]);
  return saved;
}

export function ObserverReference({ value }: { value: string }) {
  const [saved, setSaved] = useState('');
  useEffect(() => {
    console.log(ResizeObserver);
    setSaved(value); // expect: noDerivedState, noDerivedStateDeep
  }, [value]);
  return saved;
}

export function AsyncObserverHelper({ value }: { value: string }) {
  const [saved, setSaved] = useState('');
  const observe = async () => new ResizeObserver(() => {});
  useEffect(() => {
    void observe();
    setSaved(value); // expect: noDerivedState, noDerivedStateDeep
  }, [value]);
  return saved;
}

export function ShadowedObserver({ value }: { value: string }) {
  const ResizeObserver = class {
    constructor(_callback: () => void) {}
  };
  const [saved, setSaved] = useState('');
  useEffect(() => {
    new ResizeObserver(() => {});
    setSaved(value); // expect: noDerivedStateDeep
  }, [value]);
  return saved;
}
