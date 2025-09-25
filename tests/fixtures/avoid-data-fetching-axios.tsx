import { useEffect, useState } from 'react';

import axios from 'axios';

export function AxiosDataFetchingComponent({ id }: { id: number }) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setLoading(true);
      try {
        const response = await axios.get(`/api/data?id=${id}`);
        if (!ignore) {
          setData(response.data);
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
