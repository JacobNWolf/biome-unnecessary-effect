import { useEffect, useState } from 'react';

declare function submitData(data: unknown): void;
declare function revalidate(): void;
declare function fetchPosts(query: string): void;
declare function resetSearchState(): void;
declare function notify(message: string): void;

export function PureCallsOnly({
  emailStepsData,
  stepId,
  items,
  query,
}: {
  emailStepsData?: { id: string }[];
  stepId: string;
  items: string[];
  query: string;
}) {
  const [currentEmailMessage, setCurrentEmailMessage] = useState<{ id: string } | null>(null);
  const [hasMatch, setHasMatch] = useState(false);
  const [cleaned, setCleaned] = useState<string[]>([]);

  useEffect(() => {
    if (emailStepsData) {
      const match = emailStepsData?.find((step) => step.id === stepId);
      if (match) setCurrentEmailMessage(match); // expect: noDerivedState, noDerivedStateDeep
    }
  }, [emailStepsData, stepId]);

  useEffect(() => {
    if (query.trim()) {
      const normalized = items.filter(Boolean).map((item) => item.trim());
      const keys = Object.keys({ query });
      if (normalized.some((item) => item === query) && keys.length > 0) {
        setHasMatch(true); // expect: noAdjustStateOnPropChange
        setCleaned(normalized); // expect: noDerivedState, noDerivedStateDeep
      }
    }
  }, [items, query]);

  useEffect(() => {
    if (query) {
      const present = Boolean(query);
      if (present) {
        setHasMatch(true);
      }
    }
  }, [query]);

  useEffect(() => {
    if (stepId) {
      const maxLen = Math.max(1, 2);
      if (maxLen > 0) {
        setHasMatch(true);
      }
    }
  }, [stepId]);

  return [currentEmailMessage, hasMatch, cleaned];
}

export function StateOnlyHelpers({ shouldReset, shouldSubmit }: { shouldReset: boolean; shouldSubmit: boolean }) {
  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const clearFields = () => {
    const next: string[] = [];
    next.push('default');
    setName('');
    setTags(next);
  };

  function submitAndClear() {
    submitData(name);
    setName('');
  }

  useEffect(() => {
    if (shouldReset) {
      clearFields();
    }
  }, [shouldReset]);

  useEffect(() => {
    if (shouldSubmit) { // expect: noEventHandler
      submitAndClear();
    }
  }, [shouldSubmit]);

  return [name, tags];
}

export function LatchFlagOnly({ isContentClipped }: { isContentClipped: boolean }) {
  const [hasRevalidated, setHasRevalidated] = useState(false);

  useEffect(() => {
    if (!hasRevalidated) {
      revalidate();
      setHasRevalidated(true);
    }
  }, [hasRevalidated]);

  useEffect(() => {
    if (isContentClipped && !hasRevalidated) { // expect: noEventHandler
      revalidate();
      setHasRevalidated(true); // expect: noAdjustStateOnPropChange
    }
  }, [isContentClipped, hasRevalidated]);

  return hasRevalidated;
}

export function OptionalCallbackGuard({
  onSuccess,
  onReady,
}: {
  onSuccess?: (value: string) => void;
  onReady?: () => void;
}) {
  useEffect(() => {
    if (onSuccess) {
      onSuccess('done');
    }
  }, [onSuccess]);

  useEffect(() => {
    if (onReady) {
      onReady?.();
    }
  }, [onReady]);

  return null;
}

export function NonDependencyVars({ extraProp }: { extraProp: boolean }) {
  const [active, setActive] = useState(false);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (active || extraProp) {
      submitData(trigger);
    }
  }, [trigger]);

  return (
    <button
      type="button"
      onClick={() => {
        setActive(true);
        setTrigger((n) => n + 1);
      }}
    >
      Run
    </button>
  );
}

export function LocalConstStateAlias() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const staleIds = Object.keys(fieldErrors).filter(Boolean);
    if (staleIds.length > 0) { // expect: noEventHandler
      notify(staleIds.join(','));
    }
  }, [fieldErrors]);

  return (
    <button type="button" onClick={() => setFieldErrors({ name: 'Required' })}>
      Validate
    </button>
  );
}

export function SingleReportPerEffect({
  hasFakeData,
  isIncorrectPostGroupType,
  ready,
  answersErrorMessage,
}: {
  hasFakeData: boolean;
  isIncorrectPostGroupType: boolean;
  ready: boolean;
  answersErrorMessage: string;
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (hasFakeData || isIncorrectPostGroupType) return;
    if (typeof query === 'string' && query.trim()) { // expect: noEventHandler
      fetchPosts(query);
    }
    if (typeof query === 'string' && !query.trim()) {
      resetSearchState();
    }
  }, [hasFakeData, isIncorrectPostGroupType, query]);

  useEffect(() => {
    if (hasFakeData) return;
    if (answersErrorMessage) notify(answersErrorMessage); // expect: noEventHandler
  }, [hasFakeData, answersErrorMessage]);

  useEffect(() => {
    if (ready) { // expect: noEventHandler
      if (answersErrorMessage) {
        notify(answersErrorMessage);
      }
    }
  }, [ready, answersErrorMessage]);

  useEffect(() => {
    if (hasFakeData) return; // expect: noEventHandler
    if (isIncorrectPostGroupType) return;
    notify('sent');
  }, [hasFakeData, isIncorrectPostGroupType]);

  return <input value={query} onChange={(event) => setQuery(event.target.value)} />;
}

declare const router: { replace(url: string): void; push(url: string): void };
declare const api: { get(url: string): Promise<unknown> };
declare const dataLayer: unknown[];
declare function track(event: unknown): void;

export function StatementAndChainedSideEffects({
  done,
  items,
  target,
}: {
  done: boolean;
  items: string[];
  target: Record<string, unknown>;
}) {
  useEffect(() => {
    if (done) { // expect: noEventHandler
      router.replace('/next');
    }
  }, [done]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      api.get('/track?done=1');
    }
  }, [done]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      Object.assign(target, { finished: true });
    }
  }, [done, target]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      items.map(track);
    }
  }, [done, items]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      api?.get('/x').then(track);
    }
  }, [done]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      items?.filter(Boolean).forEach(track);
    }
  }, [done, items]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      api
        ?.get('/x')
        .then(track);
    }
  }, [done]);

  return null;
}

export function HelperExternalPush({ done }: { done: boolean }) {
  const [step, setStep] = useState(0);

  const goNext = () => {
    setStep(2);
    router.push('/next');
  };

  const logIt = () => {
    setStep(3);
    dataLayer.push({ event: 'done' });
  };

  useEffect(() => {
    if (done) { // expect: noEventHandler
      goNext();
    }
  }, [done]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      logIt();
    }
  }, [done]);

  return step;
}

export function CrossEffectStateAndUnusedSetter({ id }: { id: string }) {
  const [data, setData] = useState<string | null>(null);
  const [flag, _setFlag] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/${id}`)
      .then((res) => res.text())
      .then((text) => {
        if (active) setData(text);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (data) { // expect: noEventHandler
      track(data);
    }
  }, [data]);

  useEffect(() => {
    if (flag) { // expect: noEventHandler
      notify('flag');
    }
  }, [flag]);

  useEffect(() => {
    if (flag) { // expect: noEventHandler
      notify('mount');
    }
  }, []);

  return [data, flag];
}
