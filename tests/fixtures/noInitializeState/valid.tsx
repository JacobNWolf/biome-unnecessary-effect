import { useEffect, useState } from 'react';

export function InitializeAsync() {
  const [data, setData] = useState<unknown>(null);
  useEffect(() => {
    const id = setTimeout(() => setData(1), 100);
    fetch('/x').then((response) => setData(response));
    return () => clearTimeout(id);
  }, []);
  return data;
}
