import { useEffect, useState } from 'react';

declare function useCurrentPublication(): { tags: Array<{ id: string }> } | null;
declare function useEmailMessage(): { subject_line?: string } | null;

export function LatchInit() {
  const currentPublication = useCurrentPublication();
  const [isInitialized, setIsInitialized] = useState(false);
  const [primaryCategory, setPrimaryCategory] = useState('');
  useEffect(() => {
    if (currentPublication && !isInitialized) {
      setPrimaryCategory(currentPublication.tags[0]?.id ?? '');
      setIsInitialized(true);
    }
  }, [currentPublication, isInitialized]);
  return (
    <button type="button" onClick={() => setPrimaryCategory('custom')}>
      {primaryCategory}
    </button>
  );
}

export function LatchResetOutsideEffect() {
  const currentPublication = useCurrentPublication();
  const [isInitialized, setIsInitialized] = useState(false);
  const [primaryCategory, setPrimaryCategory] = useState('');
  useEffect(() => {
    if (currentPublication && !isInitialized) {
      setPrimaryCategory(currentPublication.tags[0]?.id ?? ''); // expect: noChainStateUpdates
      setIsInitialized(true);
    }
  }, [currentPublication, isInitialized]);
  return (
    <button
      type="button"
      onClick={() => {
        setPrimaryCategory('custom');
        setIsInitialized(false);
      }}
    >
      {primaryCategory}
    </button>
  );
}

export function PendingFlagChain() {
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(false);
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPending(true); // expect: noChainStateUpdates
  }, [query]);
  useEffect(() => {
    if (pending) {
      setPage(1); // expect: noChainStateUpdates
      setPending(false);
    }
  }, [pending]);
  return <input value={query} onChange={(e) => setQuery(e.target.value)} data-page={page} />;
}

export function LatchOtherBranch() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  const [label, setLabel] = useState('');
  useEffect(() => {
    setFlag(count > 3); // expect: noDerivedState, noDerivedStateDeep
  }, [count]);
  useEffect(() => {
    if (flag) setLabel('big'); // expect: noChainStateUpdates
    else setFlag(false);
  }, [flag]);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      {label}
    </button>
  );
}

export function SubjectSyncBraced() {
  const emailMessage = useEmailMessage();
  const [isSubjectFocused, setIsSubjectFocused] = useState(false);
  const [subjectLine, setSubjectLine] = useState('');
  useEffect(() => {
    if (!isSubjectFocused) {
      setSubjectLine(emailMessage?.subject_line ?? '');
    }
  }, [emailMessage?.subject_line, isSubjectFocused]);
  return (
    <input
      value={subjectLine}
      onFocus={() => setIsSubjectFocused(true)}
      onBlur={() => setIsSubjectFocused(false)}
      onChange={(e) => setSubjectLine(e.target.value)}
    />
  );
}

export function SubjectSyncUnbraced() {
  const emailMessage = useEmailMessage();
  const [isSubjectFocused, setIsSubjectFocused] = useState(false);
  const [subjectLine, setSubjectLine] = useState('');
  useEffect(() => {
    if (!isSubjectFocused) setSubjectLine(emailMessage?.subject_line ?? '');
  }, [emailMessage?.subject_line, isSubjectFocused]);
  return (
    <input
      value={subjectLine}
      onFocus={() => setIsSubjectFocused(true)}
      onBlur={() => setIsSubjectFocused(false)}
      onChange={(e) => setSubjectLine(e.target.value)}
    />
  );
}

export function NegatedGuardLiteralChain() {
  const [isLocked, setIsLocked] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (!isLocked) {
      setStatus('ready'); // expect: noChainStateUpdates
    }
  }, [isLocked]);
  return (
    <button type="button" onClick={() => setIsLocked((prev) => !prev)}>
      {status}
    </button>
  );
}

export function NegatedGuardNotInDeps() {
  const emailMessage = useEmailMessage();
  const [isLocked, setIsLocked] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (!isLocked) {
      setStatus(emailMessage?.subject_line ?? ''); // expect: noChainStateUpdates
    }
  }, [isLocked]);
  return (
    <button type="button" onClick={() => setIsLocked((prev) => !prev)}>
      {status}
    </button>
  );
}

export function NegatedGuardStableFn() {
  const t = (k: string) => k;
  const [isLocked, setIsLocked] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (!isLocked) setStatus(t('ready')); // expect: noChainStateUpdates
  }, [isLocked, t]);
  return (
    <button type="button" onClick={() => setIsLocked((prev) => !prev)}>
      {status}
    </button>
  );
}

export function ElseBranchExternal() {
  const emailMessage = useEmailMessage();
  const [isLocked, setIsLocked] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (!isLocked) {
      setStatus('open'); // expect: noChainStateUpdates
    } else {
      setStatus(emailMessage?.subject_line ?? ''); // expect: noChainStateUpdates
    }
  }, [isLocked, emailMessage]);
  return (
    <button type="button" onClick={() => setIsLocked((prev) => !prev)}>
      {status}
    </button>
  );
}

export function LatchPositiveGuard() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (isInitialized) {
      setStatus('done'); // expect: noChainStateUpdates
      setIsInitialized(true);
    }
  }, [isInitialized]);
  return status;
}

export function LatchFalseValue() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (!isInitialized) {
      setStatus('done'); // expect: noChainStateUpdates
      setIsInitialized(false);
    }
  }, [isInitialized]);
  return status;
}
