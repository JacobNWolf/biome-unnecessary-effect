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
