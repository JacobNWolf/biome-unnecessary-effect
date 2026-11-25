import { useEffect, useEffectEvent, useState } from 'react';

declare function openAsync(): Promise<void>;
declare function useImageEditor(): { editingItem: string | null };
declare function focusCanvas(): void;
declare function measureAndUpdate(): void;
declare function track(value: unknown): void;
declare const globalUrlRegex: RegExp;
declare const buckets: { get(key: string): string[] };
declare const sharedQueue: string[];
const validUrlRegex = /^https?:\/\/\S+$/i;
const typedUrlRegex: RegExp = /^https?:\/\/\S+$/i;
const globalFlagRegex = /^https?:\/\/\S+/g;
declare const externalStore: { items: string[] };

export function ResettableFlagStillReported({ clicked, onDone }: { clicked: boolean; onDone: () => void }) {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    openAsync().then(() => {
      setPending(true);
    });
  }, []);

  useEffect(() => {
    setPending(clicked);
  }, [clicked]);

  useEffect(() => {
    if (pending) onDone(); // expect: noEventHandler
  }, [pending, onDone]);

  return null;
}

export function CrossEffectBooleanLatch({ onDone }: { onDone: () => void }) {
  const [opened, setOpened] = useState(false);
  const { editingItem } = useImageEditor();

  useEffect(() => {
    openAsync().then(() => {
      setOpened(true);
    });
  }, []);

  useEffect(() => {
    if (opened && !editingItem) onDone();
  }, [opened, editingItem, onDone]);

  return null;
}

export function SeparateMountFlag() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // expect: noInitializeState
  }, []);

  useEffect(() => {
    if (mounted) {
      measureAndUpdate();
    }
  }, [mounted]);

  return mounted;
}

export function EffectEventWrittenFlag() {
  const [opened, setOpened] = useState(false);
  const open = useEffectEvent(() => {
    focusCanvas();
    setOpened(true);
  });

  useEffect(() => {
    if (!opened) open();
  }, [opened]);

  return opened;
}

export function EffectEventAndHandlerWrittenFlag() {
  const [opened, setOpened] = useState(false);
  const open = useEffectEvent(() => {
    focusCanvas();
    setOpened(true);
  });

  useEffect(() => {
    if (!opened) open(); // expect: noEventHandler
  }, [opened]);

  return (
    <button type="button" onClick={() => setOpened(false)}>
      Reset
    </button>
  );
}

export function EffectLocalPushAndRegexTest({
  url,
  active,
}: {
  url?: string;
  active: boolean;
}) {
  const [errors, setErrors] = useState<string[]>([]);

  const highlightErrors = () => {
    const next: string[] = [];
    if (!url?.trim() || !validUrlRegex.test(url.trim()) || !typedUrlRegex?.test(url.trim())) {
      next.push('url');
    }
    const shadow = () => {
      let next = 0;
      next = 1;
      return next;
    };
    void shadow;
    setErrors(next);
  };

  useEffect(() => {
    if (!active) return;
    const next: string[] = [];
    if (!url?.trim() || !validUrlRegex.test(url.trim())) {
      next.push('url');
    }
    setErrors(next); // expect: noAdjustStateOnPropChange
  }, [active, url]);

  useEffect(() => {
    if (active) {
      highlightErrors();
    }
  }, [active]);

  return errors.join(',');
}

export function StatefulRegexHelperStillReported({
  url,
  active,
  validUrlRegex: shadowedRegex,
}: {
  url: string;
  active: boolean;
  validUrlRegex: RegExp;
}) {
  const [valid, setValid] = useState(false);

  const validate = () => {
    const ok = globalUrlRegex.test(url);
    setValid(ok);
  };

  useEffect(() => {
    if (active) { // expect: noEventHandler
      validate(); // expect: noDerivedStateDeep
    }
  }, [active]);

  useEffect(() => {
    if (active) { // expect: noEventHandler
      const ok = globalFlagRegex.test(url);
      setValid(ok); // expect: noAdjustStateOnPropChange, noDerivedStateDeep
    }
  }, [active, url]);

  useEffect(() => {
    if (active) { // expect: noEventHandler
      const ok = /https?:\/\/\S+/y.test(url);
      setValid(ok); // expect: noAdjustStateOnPropChange, noDerivedStateDeep
    }
  }, [active, url]);

  useEffect(() => {
    if (active) { // expect: noEventHandler
      const ok = shadowedRegex.test(url);
      setValid(ok); // expect: noAdjustStateOnPropChange, noDerivedStateDeep
    }
  }, [active, url, shadowedRegex]);

  return valid;
}

export function ShadowedParamRegexStillReported({
  url,
  active,
  validUrlRegex,
}: {
  url: string;
  active: boolean;
  validUrlRegex: RegExp;
}) {
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (active) { // expect: noEventHandler
      const ok = validUrlRegex.test(url);
      setValid(ok); // expect: noDerivedState, noDerivedStateDeep
    }
  }, [active, url, validUrlRegex]);

  return valid;
}

export function ReassignedLocalArrayHelperStillReported({ active }: { active: boolean }) {
  const [items, setItems] = useState<string[]>([]);

  const collect = () => {
    let next: string[] = [];
    next = externalStore.items;
    next.push('x');
    setItems(next);
  };

  useEffect(() => {
    if (active) { // expect: noEventHandler
      collect();
    }
  }, [active]);

  return items.length;
}

export function NonLocalArrayPushStillReported({ active }: { active: boolean }) {
  const componentArray: string[] = [];

  useEffect(() => {
    if (active) { // expect: noEventHandler
      componentArray.push('x');
    }
  }, [active]);

  useEffect(() => {
    if (active) { // expect: noEventHandler
      const aliased = externalStore.items;
      aliased.push('x');
    }
  }, [active]);

  useEffect(() => {
    if (active) { // expect: noEventHandler
      const stored = buckets.get('key');
      stored.push('x');
    }
  }, [active]);

  useEffect(() => {
    if (active) { // expect: noEventHandler
      {
        const sharedQueue: string[] = [];
        void sharedQueue;
      }
      sharedQueue.push('x');
    }
  }, [active]);

  return componentArray.length;
}

export function CopyArrayMethodsAndDestructuringReassign({
  rows,
  active,
  patterns,
  url,
}: {
  rows: string[];
  active: boolean;
  patterns: RegExp[];
  url: string;
}) {
  const [items, setItems] = useState<string[]>([]);
  const [matched, setMatched] = useState(false);

  useEffect(() => {
    if (active) {
      const next = rows.toSorted();
      next.push('x');
      setItems(next); // expect: noDerivedState, noDerivedStateDeep
    }
  }, [active, rows]);

  useEffect(() => {
    if (active) { // expect: noEventHandler
      let next: string[] = [];
      [next] = [externalStore.items];
      next.push('x');
      setItems(next); // expect: noAdjustStateOnPropChange
    }
  }, [active]);

  useEffect(() => {
    if (active) { // expect: noEventHandler
      for (const validUrlRegex of patterns) {
        if (validUrlRegex.test(url)) {
          setMatched(true); // expect: noAdjustStateOnPropChange
        }
      }
    }
  }, [active, patterns, url]);

  return [items.length, matched];
}

export function VirtualizerScrollSync({
  menuOpen,
  activeIndex,
  virtualizer,
  scroller,
}: {
  menuOpen: boolean;
  activeIndex: number;
  virtualizer: {
    scrollToIndex: (index: number, options?: { align?: string }) => void;
    scrollToOffset: (offset: number) => void;
  };
  scroller: {
    scrollBy: (x: number, y: number) => void;
  };
}) {
  useEffect(() => {
    if (menuOpen) virtualizer.scrollToIndex(activeIndex, { align: 'center' });
  }, [menuOpen, activeIndex, virtualizer]);

  useEffect(() => {
    if (menuOpen) virtualizer.scrollToOffset(activeIndex * 24);
  }, [menuOpen, activeIndex, virtualizer]);

  useEffect(() => {
    if (menuOpen) scroller.scrollBy(0, 10);
  }, [menuOpen, scroller]);

  useEffect(() => {
    if (menuOpen) track(activeIndex); // expect: noEventHandler
  }, [menuOpen, activeIndex]);

  return null;
}
