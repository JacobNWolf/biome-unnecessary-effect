import { useEffect, useState } from 'react';

export function InitializeAsync() {
  const [data, setData] = useState<unknown>(null);
  useEffect(() => { // expect: noFetchWithoutCleanup
    const id = setTimeout(() => setData(1), 100);
    fetch('/x').then((response) => setData(response));
    return () => clearTimeout(id);
  }, []);
  return data;
}
