import { useEffect, useState } from 'react';

declare function startJob(): () => void;

export function Completion({ done }: { done: boolean }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (done) setLoading(false); // expect: noAdjustStateOnPropChange
    return () => setLoading(false);
  }, [done]);
  return loading;
}

export function CancellableJob() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const cancel = startJob();
    setLoading(true);
    return () => {
      cancel();
      setLoading(false);
    };
  }, []);
  return loading;
}
