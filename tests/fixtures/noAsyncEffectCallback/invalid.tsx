import { useEffect } from 'react';

export function AsyncEffect({ id }: { id: string }) {
  useEffect(async () => { // expect: noAsyncEffectCallback
    await fetch(`/items/${id}`);
  }, [id]);
  useEffect(async function load() { await Promise.resolve(); }, []);
  return null;
}
