import { useEffect, useState } from 'react';

declare function load(): Promise<string>;
declare function track(id: string): Promise<void>;
declare const api: { getAsset: (id: string) => Promise<string> };

export function FetchLoadingFlags({ assetId }: { assetId: string }) {
  const [asset, setAsset] = useState<string | null>(null);
  const [assetFetched, setAssetFetched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAssetFetched(false);
    api.getAsset(assetId).then((res) => {
      setAsset(res);
      setAssetFetched(true);
    });
  }, [assetId]);

  useEffect(() => {
    setLoading(true);
    const run = async () => {
      await api.getAsset(assetId);
      setLoading(false);
    };
    run();
  }, [assetId]);

  return `${asset}:${assetFetched}:${loading}`;
}

export function SyncResetAlongsideAsync({ userId }: { userId: string }) {
  const [page, setPage] = useState(0);
  const [otherPage, setOtherPage] = useState(0);
  const [thirdPage, setThirdPage] = useState(0);
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    setPage(0); // expect: noAdjustStateOnPropChange
    load().then(setData);
  }, [userId]);

  useEffect(() => {
    setOtherPage(0); // expect: noAdjustStateOnPropChange
    void (async () => {
      const result = await fetch(`/u/${userId}`); // expect: noFetchWithoutCleanup
      setData(await result.text());
    })();
  }, [userId]);

  useEffect(() => {
    setThirdPage(0); // expect: noAdjustStateOnPropChange
    const run = async () => {
      await track(userId);
    };
    run();
  }, [userId]);

  return `${page}:${otherPage}:${thirdPage}:${data}`;
}

export function Multiselect({ staticOptions, onSearch }) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!staticOptions && onSearch) {
      setLoading(true);
      onSearch().then(o => setOptions(o)).finally(() => setLoading(false));
    } else {
      const filtered = staticOptions.filter(o => o.length > 0);
      setOptions(filtered); // expect: noAdjustStateOnPropChange
    }
  }, [staticOptions, onSearch]);
  return <button onClick={() => setOptions([])}>{String(loading)}{options.length}</button>;
}

export function FontPicker({ staticOptions, onSearch }) {
  const [options, setOptions] = useState<string[]>([]);
  useEffect(() => {
    if (staticOptions) {
      setOptions(staticOptions);
    } else {
      onSearch().then(o => setOptions(o));
    }
  }, [staticOptions, onSearch]);
  return <button onClick={() => setOptions([])}>{options.length}</button>;
}

export function AsyncBeforeBranch({ staticOptions, onSearch }) {
  const [options, setOptions] = useState<string[]>([]);
  useEffect(() => {
    onSearch().then(setOptions);
    if (!staticOptions) {
      return;
    } else {
      setOptions(staticOptions);
    }
  }, [staticOptions, onSearch]);
  return <button onClick={() => setOptions([])}>{options.length}</button>;
}

export function AsyncInsideElse({ staticOptions, onSearch }) {
  const [options, setOptions] = useState<string[]>([]);
  useEffect(() => {
    if (!staticOptions) {
      onSearch().then(setOptions);
    } else {
      setOptions(staticOptions);
      onSearch().then(() => {}, () => setOptions([]));
    }
  }, [staticOptions, onSearch]);
  return <button onClick={() => setOptions([])}>{options.length}</button>;
}

export function AsyncOutsideNestedBranch({ enabled, staticOptions, onSearch }) {
  const [options, setOptions] = useState<string[]>([]);
  useEffect(() => {
    if (enabled) { // expect: noEventHandler
      onSearch().then(setOptions);
      if (!staticOptions) {
        return;
      } else {
        setOptions(staticOptions);
      }
    }
  }, [enabled, staticOptions, onSearch]);
  return <button onClick={() => setOptions([])}>{options.length}</button>;
}
