import { useEffect, useState } from 'react';

export function Hydration() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true); // expect: noInitializeState
  }, []);
  return mounted;
}

export function OrdinaryBooleanInitialization() {
  const [active, setActive] = useState(true);
  useEffect(() => {
    setActive(true); // expect: noInitializeState
  }, []);
  return active;
}
