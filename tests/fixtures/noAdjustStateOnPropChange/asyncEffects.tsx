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
