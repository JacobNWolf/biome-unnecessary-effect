import { useEffect, useRef, useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setCount(count + 1); // expect: noSetStateInEffectWithoutDeps
    if (window.innerWidth !== width) setWidth(window.innerWidth);
  });
  return count + width;
}

export const ArrowCounter = () => {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(n + 1); // expect: noSetStateInEffectWithoutDeps
  });
};

export function UnrelatedGuard({ enabled }: { enabled: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    setTick((t) => t + 1); // expect: noSetStateInEffectWithoutDeps
  });
  return tick;
}

export function SetterBeforeGuard() {
  const lastRef = useRef(0);
  const [n, setN] = useState(0);
  useEffect(() => {
    setN((v) => v + 1); // expect: noSetStateInEffectWithoutDeps
    if (lastRef.current === n) return;
    lastRef.current = n;
  });
  return n;
}

export function NestedLoopReturn({ items }: { items: number[] }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(n + 1); // expect: noSetStateInEffectWithoutDeps
    for (const i of items) {
      if (i < 0) return;
    }
  });
  return n;
}

export function GuardReturnsCleanup({ el }: { el: HTMLElement | null }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(n + 1); // expect: noSetStateInEffectWithoutDeps
    if (el) {
      const id = setTimeout(() => {}, 1);
      return () => clearTimeout(id);
    }
  });
  return n;
}
