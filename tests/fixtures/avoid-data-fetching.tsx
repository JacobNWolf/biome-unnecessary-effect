import { useEffect, useState } from 'react';

export function DataFetchingComponent({ id }: { id: number }) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/data?id=${id}`);
        const json = await response.json();
        if (!ignore) {
          setData(json);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [id]);

  return <div>{loading ? 'Loading...' : JSON.stringify(data)}</div>;
}
