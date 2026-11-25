import { useEffect, useState } from 'react';

declare function useCandidates(): { id: string }[];
declare function getIsLiked(likes: number, admin: boolean): boolean;
declare const api: { getAsset: (id: string) => Promise<string> };

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

export function InvokedCallbackDep({
  onChange,
}: {
  onChange: (params: { query: string }) => void;
}) {
  const [query, setQuery] = useState('');
  const [exportParams, setExportParams] = useState<{ query: string }>({ query: '' });
  useEffect(() => {
    const params = { query };
    onChange(params); // expect: noPassLiveStateToParent
    setExportParams(params); // expect: noDerivedState, noDerivedStateDeep
  }, [onChange, query]);
  return (
    <div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <span>{exportParams.query}</span>
    </div>
  );
}

export function FetchLoadingFlag({ assetId }: { assetId: string }) {
  const [asset, setAsset] = useState<string | null>(null);
  const [assetFetched, setAssetFetched] = useState(false);
  useEffect(() => {
    setAssetFetched(false);
    api.getAsset(assetId).then((res) => {
      setAsset(res);
      setAssetFetched(true);
    });
  }, [assetId]);
  return `${asset}:${assetFetched}`;
}

export function BooleanGateWithHookData({
  isOpen,
  enabled,
}: {
  isOpen: boolean;
  enabled: boolean;
}) {
  const candidates = useCandidates();
  const [selected, setSelected] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSelected(candidates[0]?.id ?? null);
    }
  }, [isOpen, candidates]);

  useEffect(() => {
    if (enabled) {
      setVersion((count) => count + 1);
    }
  }, [enabled]);

  return (
    <div>
      <button onClick={() => setSelected(null)}>{selected}</button>
      <button onClick={() => setVersion(0)}>{version}</button>
    </div>
  );
}

export function InstanceFallbackGate({
  editor,
  provider,
}: {
  editor: { id: string };
  provider: { id: string };
}) {
  const candidates = useCandidates();
  const [html, setHtml] = useState('');
  const [count, setCount] = useState(0);

  useEffect(() => {
    setHtml(candidates[0]?.id ?? '');
  }, [editor, candidates]);

  useEffect(() => {
    setCount((prev) => prev + 1);
  }, [provider]);

  return (
    <div>
      <button onClick={() => setHtml('')}>{html}</button>
      <button onClick={() => setCount(0)}>{count}</button>
    </div>
  );
}

export function LiteralResetOnOpen({ isOpen }: { isOpen: boolean }) {
  const [draft, setDraft] = useState('');
  useEffect(() => {
    setDraft(''); // expect: noAdjustStateOnPropChange
  }, [isOpen]);
  return <input value={draft} onChange={(event) => setDraft(event.target.value)} />;
}

export function IfElseDeduplication({
  src,
  mode,
}: {
  src: string | null;
  mode: 'a' | 'b' | 'c';
}) {
  const [imageUrl, setImageUrl] = useState('');
  const [label, setLabel] = useState('');
  const [secondary, setSecondary] = useState('');

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

  return (
    <div>
      <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
      <input value={label} onChange={(event) => setLabel(event.target.value)} />
      <input value={secondary} onChange={(event) => setSecondary(event.target.value)} />
    </div>
  );
}

export function YieldDerivedFromState({ tab }: { tab: string }) {
  const [query, setQuery] = useState('');
  const [derivedSummary, setDerivedSummary] = useState('');
  const [editableSummary, setEditableSummary] = useState('');

  useEffect(() => {
    setDerivedSummary(query.trim()); // expect: noDerivedState, noDerivedStateDeep
  }, [tab, query]);

  useEffect(() => {
    setEditableSummary(query.trim()); // expect: noAdjustStateOnPropChange
  }, [tab, query]);

  return (
    <div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <span>{derivedSummary}</span>
      <input value={editableSummary} onChange={(event) => setEditableSummary(event.target.value)} />
    </div>
  );
}
