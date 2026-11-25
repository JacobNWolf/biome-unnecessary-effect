import { useEffect, useEffectEvent, useState } from 'react';

declare function openAsync(): Promise<void>;
declare function useImageEditor(): { editingItem: string | null };
declare function focusCanvas(): void;
declare function measureAndUpdate(): void;
declare function track(value: unknown): void;
declare const validUrlRegex: RegExp;
declare const externalStore: { items: string[] };

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
    if (!url?.trim() || !validUrlRegex.test(url.trim())) {
      next.push('url');
    }
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

  return componentArray.length;
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
