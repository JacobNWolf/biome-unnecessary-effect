import { useEffect, useState } from 'react';

declare const router: { replace(url: string): void; push(url: string): void };

export function ChainWithRouterReplace() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step > 3) { // expect: noEventHandler
      router.replace('/done');
      setDone(true);
    }
  }, [step]);

  return (
    <button type="button" onClick={() => setStep((s) => s + 1)}>
      {String(done)}
    </button>
  );
}

export function ChainWithExternalPushHelper() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const finish = () => {
    setDone(true);
    router.push('/done');
  };

  useEffect(() => {
    if (step > 3) { // expect: noEventHandler
      finish();
      setDone(true);
    }
  }, [step]);

  return (
    <button type="button" onClick={() => setStep((s) => s + 1)}>
      {String(done)}
    </button>
  );
}

export function ChainWithStateOnlyHelper() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState('');

  const resetMsg = () => {
    setMsg('');
  };

  useEffect(() => {
    if (step > 3) {
      resetMsg(); // expect: noChainStateUpdates
      setDone(true); // expect: noChainStateUpdates
    }
  }, [step]);

  return (
    <button type="button" onClick={() => setStep((s) => s + 1)}>
      {String(done) + msg}
    </button>
  );
}
