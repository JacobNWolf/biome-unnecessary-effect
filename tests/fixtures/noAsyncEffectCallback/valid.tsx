import { useEffect } from 'react';

export function AsyncInside({ id }: { id: string }) {
  useEffect(() => {
    let ignore = false;
    async function load() {
      await fetch(`/items/${id}`);
      if (ignore) return;
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id]);
  return null;
}
