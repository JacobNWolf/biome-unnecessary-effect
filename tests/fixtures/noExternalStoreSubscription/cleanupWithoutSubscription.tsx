import { useEffect, useState } from 'react';

export function Completion({ done }: { done: boolean }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (done) setLoading(false); // expect: noAdjustStateOnPropChange
    return () => setLoading(false);
  }, [done]);
  return loading;
}
