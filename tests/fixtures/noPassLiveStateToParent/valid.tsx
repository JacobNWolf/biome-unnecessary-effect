import { useEffect, useState } from 'react';

declare function useCallbacks(): { onFetched: (data: string) => void };

export function Local({ offset }: { offset: number }) {
  const [count] = useState(0);
  const [total, setTotal] = useState(0);
  const update = (v: number) => setTotal(v + offset);
  useEffect(() => {
    update(count);
  }, [count, update]);
  return <button onClick={() => setTotal(0)}>{total}</button>;
}

export function Hook() {
  const [data] = useState('');
  const { onFetched } = useCallbacks();
  useEffect(() => {
    onFetched(data);
  }, [onFetched, data]);
}
