import { useEffect, useState } from 'react';

declare const router: { replace(url: string): void; push(url: string): void };
declare const api: { get(url: string): Promise<unknown> };
declare const dataLayer: unknown[];
declare function track(event: unknown): void;
declare function notify(message: string): void;

export function StatementAndChainedSideEffects({
  done,
  items,
  target,
}: {
  done: boolean;
  items: string[];
  target: Record<string, unknown>;
}) {
  useEffect(() => {
    if (done) { // expect: noEventHandler
      router.replace('/next');
    }
  }, [done]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      api.get('/track?done=1');
    }
  }, [done]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      Object.assign(target, { finished: true });
    }
  }, [done, target]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      items.map(track);
    }
  }, [done, items]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      api?.get('/x').then(track);
    }
  }, [done]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      items?.filter(Boolean).forEach(track);
    }
  }, [done, items]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      api
        ?.get('/x')
        .then(track);
    }
  }, [done]);

  return null;
}

export function HelperExternalPush({ done }: { done: boolean }) {
  const [step, setStep] = useState(0);

  const goNext = () => {
    setStep(2);
    router.push('/next');
  };

  const logIt = () => {
    setStep(3);
    dataLayer.push({ event: 'done' });
  };

  useEffect(() => {
    if (done) { // expect: noEventHandler
      goNext();
    }
  }, [done]);

  useEffect(() => {
    if (done) { // expect: noEventHandler
      logIt();
    }
  }, [done]);

  return step;
}

export function CrossEffectStateAndUnusedSetter({ id }: { id: string }) {
  const [data, setData] = useState<string | null>(null);
  const [flag, _setFlag] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/${id}`)
      .then((res) => res.text())
      .then((text) => {
        if (active) setData(text);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (data) { // expect: noEventHandler
      track(data);
    }
  }, [data]);

  useEffect(() => {
    if (flag) { // expect: noEventHandler
      notify('flag');
    }
  }, [flag]);

  useEffect(() => {
    if (flag) { // expect: noEventHandler
      notify('mount');
    }
  }, []);

  return [data, flag];
}
