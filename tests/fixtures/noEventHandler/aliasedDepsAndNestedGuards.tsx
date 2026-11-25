import { useEffect, useMemo, useState } from 'react';

declare function submit(draft: string): void;
declare function setCookie(name: string, days: number): void;
declare function trackMilestone(id: string): void;
declare function useScrollSignal(): { show: boolean };
declare function usePublication(): { publicationId: string | null };

export function AliasWithSourceInDeps() {
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const shouldSubmit = draft.length > 0 && !saving;

  useEffect(() => {
    if (shouldSubmit) submit(draft); // expect: noEventHandler
  }, [shouldSubmit, draft]);

  return <input value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => setSaving(false)} />;
}

export function AliasOnlyInDeps() {
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const shouldSubmit = draft.length > 0 && !saving;

  useEffect(() => {
    if (shouldSubmit) { // expect: noEventHandler
      submit('ready');
    }
  }, [shouldSubmit]);

  return <input value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => setSaving(false)} />;
}

export function MemoAliasInDeps() {
  const [hasChanges, setHasChanges] = useState(false);
  const canSave = useMemo(() => hasChanges, [hasChanges]);

  useEffect(() => {
    if (canSave) { // expect: noEventHandler
      submit('changes');
    }
  }, [canSave]);

  return <button type="button" onClick={() => setHasChanges(true)} />;
}

export function NestedConfigGuardUnderHookSignal({ cookieDays }: { cookieDays: number }) {
  const { show } = useScrollSignal();

  useEffect(() => {
    if (show) {
      if (cookieDays) setCookie('seen', cookieDays);
    }
  }, [show, cookieDays]);

  return null;
}

export function NestedConfigGuardUnderHookId({ milestoneId }: { milestoneId: string }) {
  const { publicationId } = usePublication();

  useEffect(() => {
    if (publicationId) {
      if (milestoneId) {
        trackMilestone(milestoneId);
      }
    }
  }, [publicationId, milestoneId]);

  return null;
}

export function OuterStateAliasWrapsConfigGuard({ cookieDays }: { cookieDays: number }) {
  const [open, setOpen] = useState(false);
  const showPopup = open;

  useEffect(() => {
    if (showPopup) { // expect: noEventHandler
      if (cookieDays) {
        setCookie('popup', cookieDays);
      }
    }
  }, [showPopup, cookieDays]);

  return <button type="button" onClick={() => setOpen(true)} />;
}
