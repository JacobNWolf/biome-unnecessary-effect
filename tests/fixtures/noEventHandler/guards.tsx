import { useEffect } from 'react';

declare function useSearchParams(): [URLSearchParams];
declare function submit(value: string): void;

export function Availability({ item, items }: { item?: { name: string }; items: string[] }) {
  useEffect(() => {
    if (!item) return;
    submit(item.name);
  }, [item]);
  useEffect(() => {
    if (item == null) return;
    submit(item.name);
  }, [item]);
  useEffect(() => {
    if (item === undefined) { return; }
    submit(item.name);
  }, [item]);
  useEffect(() => {
    if (!items.length) return;
    submit(items[0]);
  }, [items]);
}

export function Arrival({ notify }: { notify: () => void }) {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (notify && searchParams.get('completed')) {
      notify();
    }
  }, [searchParams, notify]);
}

export function ValueGuard({ status, code }: { status: string; code: string }) {
  useEffect(() => {
    if (status !== 'done') return; // expect: noEventHandler
    submit(status);
  }, [status]);
  useEffect(() => {
    if (code.length === 6) { // expect: noEventHandler
      submit(code);
    }
  }, [code]);
}
