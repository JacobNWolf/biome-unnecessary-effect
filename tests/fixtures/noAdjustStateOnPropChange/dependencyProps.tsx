import { useEffect, useState } from 'react';

declare function useCandidates(): { id: string }[];
declare function getIsLiked(likes: number, admin: boolean): boolean;

export function NonDependencyProp({
  fetched,
  likes,
  admin,
}: {
  fetched: boolean;
  likes: number;
  admin: boolean;
}) {
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    if (fetched) {
      setLiked(getIsLiked(likes, admin)); // expect: noAdjustStateOnPropChange
    }
  }, [fetched]);
  return <button onClick={() => setLiked((prev) => !prev)}>{String(liked)}</button>;
}

export function NonDepPropInGuardAndArg({
  userId,
  nonDepFlag,
  nonDepTitle,
}: {
  userId: string;
  nonDepFlag: boolean;
  nonDepTitle: string;
}) {
  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (nonDepFlag) {
      setPage(0); // expect: noAdjustStateOnPropChange
    }
  }, [userId]);

  useEffect(() => {
    setDraft(nonDepTitle); // expect: noAdjustStateOnPropChange
  }, [userId]);

  return (
    <div>
      <button onClick={() => setPage(1)}>{page}</button>
      <input value={draft} onChange={(event) => setDraft(event.target.value)} />
    </div>
  );
}

export function InvokedCallbackDep({
  onChange,
  onLoad,
}: {
  onChange: (params: { query: string }) => void;
  onLoad: () => void;
}) {
  const [query, setQuery] = useState('');
  const [exportParams, setExportParams] = useState<{ query: string }>({ query: '' });
  const [page, setPage] = useState(0);

  useEffect(() => {
    const params = { query };
    onChange(params); // expect: noPassLiveStateToParent
    setExportParams(params); // expect: noDerivedState, noDerivedStateDeep
  }, [onChange, query]);

  useEffect(() => {
    onLoad();
    setPage(0);
  }, [onLoad]);

  return (
    <div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <span>{exportParams.query}</span>
      <button onClick={() => setPage(1)}>{page}</button>
    </div>
  );
}

export function ConsistentPropNames({
  open,
  show,
}: {
  open: boolean;
  show: boolean;
}) {
  const candidates = useCandidates();
  const [selected, setSelected] = useState<string | null>(null);
  const [opens, setOpens] = useState(0);

  useEffect(() => {
    if (open) {
      setSelected(candidates[0]?.id ?? null); // expect: noAdjustStateOnPropChange
    }
  }, [open, candidates]);

  useEffect(() => {
    setOpens((count) => count + 1); // expect: noAdjustStateOnPropChange
  }, [show]);

  return (
    <div>
      <button onClick={() => setSelected(null)}>{selected}</button>
      <button onClick={() => setOpens(0)}>{opens}</button>
    </div>
  );
}

export function InvokedFormatterInArg({
  format,
  value,
}: {
  format: (v: string) => string;
  value: string;
}) {
  const [text, setText] = useState('');
  useEffect(() => {
    setText(format(value)); // expect: noAdjustStateOnPropChange
  }, [format, value]);
  return <input value={text} onChange={(event) => setText(event.target.value)} />;
}
