import { useEffect, useState } from 'react';

declare function useLocalState<T>(initial: T): [T, (value: T) => void];
declare function track(value: boolean): void;
declare function read(): boolean;

export function CustomMixed({ open }) {
  const [value, setValue] = useLocalState('');
  useEffect(() => {
    if (open) setValue('a'); // expect: noAdjustStateOnPropChange
    else setValue('b');
  }, [open]);
  return value;
}

export function CustomMixedBlocks({ open }) {
  const [value, setValue] = useLocalState('');
  useEffect(() => {
    if (open) {
      setValue('a'); // expect: noAdjustStateOnPropChange
    } else {
      setValue('b');
    }
  }, [open]);
  return value;
}

export function LiteralSeed({ open }) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (seen) return;
    if (open) {
      setSeen(true); // expect: noAdjustStateOnPropChange
    }
  }, [seen, open]);
  return seen;
}

export function NonliteralSeed({ open }) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (seen) return;
    if (open) {
      setSeen(read());
    }
  }, [seen, open]);
  return seen;
}

export function StateOnlyLatch({ open }) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (seen) return;
    setSeen(true);
  }, [seen, open]);
  return seen;
}

export function MixedPropStateSeed({ enabled, show }) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!enabled || isOpen) return;
    if (show) {
      setIsOpen(true);
    }
  }, [enabled, isOpen, show]);
  return isOpen;
}

export function MixedUpdater({ items, advance }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (items.length) {
      setCount(items.length);
    }
    if (advance) {
      setCount(previous => previous + 1); // expect: noAdjustStateOnPropChange
    }
  }, [items, advance]);
  return count;
}

export function SwitchBinding({ open, choice }) {
  const [seen, setSeen] = useLocalState(false);
  useEffect(() => {
    switch (choice) {
      case 'track':
        const setSeen = track;
        void setSeen;
        break;
    }
    if (open) {
      setSeen(true); // expect: noAdjustStateOnPropChange
    }
  }, [open, choice]);
  return seen;
}

export function SwitchLocalBinding({ open, choice }) {
  const [seen, setSeen] = useLocalState(false);
  useEffect(() => {
    switch (choice) {
      case 'track':
        const setSeen = track;
        if (open) setSeen(true); // expect: noEventHandler
        break;
    }
  }, [open, choice]);
  return seen;
}

export function VarLoopBinding({ open }) {
  const [seen, setSeen] = useLocalState(false);
  useEffect(() => {
    for (var setSeen of [track]) {}
    if (open) { // expect: noEventHandler
      setSeen(true);
    }
  }, [open]);
  return seen;
}

export function VarForInBinding({ open }) {
  const [seen, setSeen] = useLocalState(false);
  useEffect(() => {
    for (var setSeen in { track }) {}
    if (open) { // expect: noEventHandler
      setSeen(true);
    }
  }, [open]);
  return seen;
}

export function LexicalLoopBindings({ open }) {
  const [seen, setSeen] = useLocalState(false);
  useEffect(() => {
    for (let setSeen of [track]) {}
    for (const setSeen in { track }) {}
    if (open) {
      setSeen(true); // expect: noAdjustStateOnPropChange
    }
  }, [open]);
  return seen;
}

export function MixedStateRead({ items, advance }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (items.length) {
      setCount(items.length);
    }
    if (advance) {
      setCount(count + 1); // expect: noAdjustStateOnPropChange
    }
  }, [items, advance]);
  return count;
}

export function MixedAliasUpdater({ items, advance }) {
  const [count, setCount] = useState(0);
  const updateCount = setCount;
  useEffect(() => {
    if (items.length) {
      updateCount(items.length);
    }
    if (advance) {
      updateCount(0); // expect: noAdjustStateOnPropChange
      setCount(previous => previous + 1); // expect: noAdjustStateOnPropChange
    }
  }, [items, advance]);
  return count;
}

export function MixedTimerWrite({ items, advance }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (items.length) {
      setCount(items.length);
    }
    if (advance) {
      setCount(0); // expect: noAdjustStateOnPropChange
    }
    const timer = setTimeout(() => setCount(1), 100);
    return () => clearTimeout(timer);
  }, [items, advance]);
  return count;
}

export function MixedUpdaterOtherEffect({ items, advance, tick }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (items.length) {
      setCount(items.length);
    }
    if (advance) {
      setCount(0); // expect: noAdjustStateOnPropChange
    }
  }, [items, advance]);
  useEffect(() => {
    if (tick) {
      setCount(previous => previous + 1); // expect: noAdjustStateOnPropChange
    }
  }, [tick]);
  return count;
}
