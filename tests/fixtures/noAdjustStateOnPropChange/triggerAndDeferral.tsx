import { useEffect, useState } from 'react';

type Creative = { id: string; kind: string };
type Slot = { id: string; name?: string };
type Fetcher = { state: string; data?: { toast?: { status: string; message: string } } };
type Editor = { storage: { resolve: (src: string) => string } };
type Provider = { send: (message: string) => void };

declare function useCreatives(enabled: boolean): { creatives: Creative[]; isSuccess: boolean };
declare function useNames(): Record<string, string>;
declare function useVersions(): { versions: number[] };
declare function useFetcher(): Fetcher;
declare function notify(options: { id: string }): void;

export function AcceptOfferModal({ isOpen, initialTab }: { isOpen: boolean; initialTab: string }) {
  const { creatives, isSuccess } = useCreatives(isOpen);
  const [selectedTab, setSelectedTab] = useState('');
  const [advertisement, setAdvertisement] = useState<Creative | null>(null);

  useEffect(() => {
    if (advertisement || !isOpen || !isSuccess) return;
    const initialCreative = creatives.find((ad) => ad.kind === initialTab);
    const defaultCreative = initialCreative || creatives[0];
    if (defaultCreative) {
      setSelectedTab(defaultCreative.kind);
      setAdvertisement(defaultCreative);
    }
  }, [advertisement, isOpen, isSuccess, initialTab, creatives]);

  return (
    <button type="button" onClick={() => setAdvertisement(null)}>
      {selectedTab}
      {advertisement?.id}
    </button>
  );
}

export function EditSlotsModal({ isOpen }: { isOpen: boolean }) {
  const names = useNames();
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setSlots((prev) => prev.map((slot) => ({ ...slot, name: names[slot.id] })));
  }, [isOpen, names]);

  return (
    <button type="button" onClick={() => setSlots([])}>
      {slots.length}
    </button>
  );
}

export function useFieldErrors({ errorDisplay, visibleIds }: { errorDisplay: string; visibleIds: Set<string> }) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (errorDisplay === 'inline') return;
    setFieldErrors((previous) => Object.fromEntries(Object.entries(previous).filter(([id]) => visibleIds.has(id))));
  }, [errorDisplay, fieldErrors]);

  return { fieldErrors, clear: () => setFieldErrors({}) };
}

export function HistoryModal({ provider }: { provider: Provider }) {
  const { versions } = useVersions();
  const [currentVersionId, setCurrentVersionId] = useState<number | null>(null);

  useEffect(() => {
    if (versions.length > 0) {
      setCurrentVersionId(versions[0]);
    }
  }, [provider, versions]);

  return (
    <button type="button" onClick={() => provider.send(String(currentVersionId))} onBlur={() => setCurrentVersionId(null)}>
      {currentVersionId}
    </button>
  );
}

export function SeedVersionModal({ provider, currentVersion }: { provider: Provider; currentVersion: number }) {
  const { versions } = useVersions();
  const [currentVersionId, setCurrentVersionId] = useState<number | null>(null);

  useEffect(() => {
    if (currentVersionId === null && versions.length > 0) {
      const initialVersion = versions[0];
      setCurrentVersionId(initialVersion);
    }
  }, [provider, currentVersionId, currentVersion, versions]);

  return (
    <button type="button" onClick={() => setCurrentVersionId(currentVersion)}>
      {currentVersionId}
    </button>
  );
}

export function useSendEvent({ event_type }: { event_type: string }) {
  const fetcher = useFetcher();
  const [isLoading, setIsLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.toast) {
      setIsLoading(false);
      if (fetcher.data.toast.status === 'error') {
        setHasFailed(true);
      } else {
        notify({ id: `sso-${event_type}` });
      }
    }
  }, [fetcher.state, fetcher.data, event_type]);

  return { isLoading, hasFailed, retry: () => setIsLoading(true), reset: () => setHasFailed(false) };
}

export function usePopup({ isEnabled }: { isEnabled: boolean }) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isEnabled && isIntersecting && !isOpen) {
      setIsOpen(true);
    }
  }, [isOpen, isIntersecting, isEnabled]);

  return { isOpen, onClose: () => setIsOpen(false), onScroll: () => setIsIntersecting(true) };
}

export function useConvertModal({ isOpen }: { isOpen: boolean }) {
  const { creatives: candidates } = useCreatives(isOpen);
  const [targetId, setTargetId] = useState('');

  useEffect(() => {
    if (isOpen && !targetId && candidates[0]) {
      setTargetId(candidates[0].id);
    }
  }, [isOpen, targetId, candidates]);

  return { targetId, select: setTargetId };
}

export function ImageView({ node, editor }: { node: { attrs: { src: string } }; editor: Editor }) {
  const { src } = node.attrs;
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const resolved = editor.storage.resolve(src);
    setImage(resolved); // expect: noAdjustStateOnPropChange
  }, [editor, src]);

  return <img src={image ?? ''} alt="" onError={() => setImage(null)} />;
}

export function EditKeyModal({
  isOpen,
  id,
  initialName,
  initialIds,
}: {
  isOpen: boolean;
  id: string;
  initialName: string;
  initialIds: string[];
}) {
  const [name, setName] = useState(initialName);
  const [ids, setIds] = useState(initialIds);

  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (isOpen) {
      setName(initialName);
      setIds(initialIds);
    }
  }, [isOpen, id, initialName, initialIds]);

  return (
    <input value={`${name}${ids.join(',')}`} onChange={(event) => setName(event.target.value)} onBlur={() => setIds([])} />
  );
}

export function RenameModal({ isOpen, initialName }: { isOpen: boolean; initialName: string }) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (isOpen) {
      setName(initialName); // expect: noAdjustStateOnPropChange
    }
  }, [isOpen, initialName]);

  return <input value={name} onChange={(event) => setName(event.target.value)} />;
}

export function ResetOnOpen({ isOpen }: { isOpen: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0); // expect: noAdjustStateOnPropChange
  }, [isOpen]);

  return (
    <button type="button" onClick={() => setStep(step + 1)}>
      {step}
    </button>
  );
}

declare function toRgba(color: string): { a: number };

export function ColorPickerInput({ color }: { color?: string }) {
  const [opacity, setOpacity] = useState<number>();
  const [inner, setInner] = useState<string>();
  useEffect(() => {
    if (!color) {
      setOpacity(1);
      setInner(undefined);
      return;
    }
    const { a } = toRgba(color);
    setOpacity(a); // expect: noDerivedState, noDerivedStateDeep
    setInner(color); // expect: noDerivedState, noDerivedStateDeep
  }, [color]);
  return <input value={inner} style={{ opacity }} readOnly />;
}
