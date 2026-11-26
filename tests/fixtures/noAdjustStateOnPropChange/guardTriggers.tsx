import { useEffect, useState } from 'react';

declare function useConfig(): { config: { active?: boolean }; socials: string[] };
declare function read(): number;
declare function useOrganizations(): { orgs: { id: string }[] };

export function AutoPauseModal({ isOpen }) {
  const { config } = useConfig();
  const [enabled, setEnabled] = useState(false);
  const [draft, setDraft] = useState('');
  useEffect(() => {
    if (!isOpen) return;
    setEnabled(config?.active ?? false); // expect: noAdjustStateOnPropChange
  }, [isOpen, config]);
  return <input value={draft} onChange={event => { setDraft(event.target.value); setEnabled(false); }} />;
}

export function SocialsSelectionModal({ isOpen }) {
  const { socials } = useConfig();
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    if (!isOpen) return;
    setSelected(socials.filter(s => s.length > 0)); // expect: noAdjustStateOnPropChange
  }, [isOpen, socials]);
  return <button onClick={() => setSelected([])}>{selected.length}</button>;
}

export function EditSlotsModal({ isOpen }) {
  const [slots, setSlots] = useState<string[]>([]);
  useEffect(() => {
    if (!isOpen) return;
    setSlots(prev => prev.filter(slot => slot.length > 0));
  }, [isOpen]);
  return <button onClick={() => setSlots([])}>{slots.length}</button>;
}

export function useAudioPlayer({ enablePlaybackSpeed }) {
  const [rate, setRate] = useState(1);
  useEffect(() => {
    if (!enablePlaybackSpeed) return;
    setRate(read());
  }, [enablePlaybackSpeed]);
  return { rate, setRate };
}

export function useProfileQuestionAnswers({ errorDisplay }) {
  const [answers, setAnswers] = useState({});
  useEffect(() => {
    if (!errorDisplay) return;
    setAnswers(prev => ({ ...prev, error: true }));
  }, [errorDisplay]);
  return { answers, setAnswers };
}

export function useConsentOrganization({ organizationId }) {
  const { orgs } = useOrganizations();
  const [selectedId, setSelectedId] = useState('');
  useEffect(() => {
    if (selectedId || orgs.length === 0) return;
    const next = organizationId || orgs[0].id;
    setSelectedId(next);
  }, [selectedId, orgs, organizationId]);
  return { selectedId, setSelectedId };
}

export function AdminJsonEditor({ isOpen, content }) {
  const [structure, setStructure] = useState<string>();
  useEffect(() => {
    if (!structure) {
      setStructure(content); // expect: noAdjustStateOnPropChange
    }
  }, [isOpen]);
  return <input value={structure} onChange={event => setStructure(event.target.value)} />;
}

export function useEmailCaptureModal({ enabled, show }) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!enabled || isOpen) return;
    if (show) setIsOpen(true);
  }, [enabled, isOpen, show]);
  return { isOpen, setIsOpen };
}

export function ConvertToDefaultModal({ isOpen }) {
  const { orgs: candidates } = useOrganizations();
  const [targetId, setTargetId] = useState('');
  useEffect(() => {
    if (isOpen && !targetId && candidates[0]) {
      setTargetId(candidates[0].id);
    }
  }, [isOpen, targetId, candidates]);
  return <input value={targetId} onChange={event => setTargetId(event.target.value)} />;
}

export function NewPageModal({ category }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  useEffect(() => {
    if (selectedCategory) return;
    const next = category;
    setSelectedCategory(next);
  }, [selectedCategory, category]);
  return <input value={selectedCategory} onChange={event => setSelectedCategory(event.target.value)} />;
}

export function AcceptOfferModal({ isOpen }) {
  const { orgs } = useOrganizations();
  const [advertisement, setAdvertisement] = useState('');
  useEffect(() => {
    if (advertisement || !isOpen) return;
    const next = orgs[0]?.id;
    setAdvertisement(next);
  }, [advertisement, isOpen, orgs]);
  return <input value={advertisement} onChange={event => setAdvertisement(event.target.value)} />;
}
