import { useEffect, useState } from 'react';

declare function doNothing(): void;
declare function subscribe(cb: () => void): void;

export function IfElseDeduplication({
  src,
  mode,
  p,
  q,
}: {
  src: string | null;
  mode: 'a' | 'b' | 'c';
  p: boolean;
  q: boolean;
}) {
  const [imageUrl, setImageUrl] = useState('');
  const [label, setLabel] = useState('');
  const [secondary, setSecondary] = useState('');
  const [nested, setNested] = useState(0);
  const [asyncUrl, setAsyncUrl] = useState('');

  useEffect(() => {
    if (src) {
      setImageUrl(src); // expect: noAdjustStateOnPropChange
    } else {
      setImageUrl('');
    }
  }, [src]);

  useEffect(() => {
    if (mode === 'a') {
      setLabel('A'); // expect: noAdjustStateOnPropChange
    } else if (mode === 'b') {
      setLabel('B');
    } else {
      setLabel('C');
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'a') {
      setSecondary(''); // expect: noAdjustStateOnPropChange
    } else if (mode === 'b') {
      setSecondary('B');
    }
  }, [mode]);

  useEffect(() => {
    if (p) {
      if (q) {
        doNothing();
      } else {
        setNested(1); // expect: noAdjustStateOnPropChange
      }
    } else {
      setNested(2);
    }
  }, [p, q]);

  useEffect(() => {
    if (src) {
      subscribe(() => setAsyncUrl(src));
    } else {
      setAsyncUrl(''); // expect: noAdjustStateOnPropChange
    }
  }, [src]);

  return (
    <div>
      <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
      <input value={label} onChange={(event) => setLabel(event.target.value)} />
      <input value={secondary} onChange={(event) => setSecondary(event.target.value)} />
      <button onClick={() => setNested(3)}>{nested}</button>
      <input value={asyncUrl} onChange={(event) => setAsyncUrl(event.target.value)} />
    </div>
  );
}

export function YieldDerivedFromState({ tab }: { tab: string }) {
  const [query, setQuery] = useState('');
  const [derivedSummary, setDerivedSummary] = useState('');
  const [editableSummary, setEditableSummary] = useState('');
  const [changes, setChanges] = useState(0);

  useEffect(() => {
    setDerivedSummary(query.trim()); // expect: noDerivedState, noDerivedStateDeep
  }, [tab, query]);

  useEffect(() => {
    setEditableSummary(query.trim()); // expect: noAdjustStateOnPropChange
  }, [tab, query]);

  useEffect(() => {
    setChanges(changes + 1); // expect: noAdjustStateOnPropChange
  }, [tab]);

  return (
    <div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <span>{derivedSummary}</span>
      <input value={editableSummary} onChange={(event) => setEditableSummary(event.target.value)} />
      <span>{changes}</span>
    </div>
  );
}
