import { useEffect, useState } from 'react';

declare function useSearchParams(init?: Record<string, string>): [URLSearchParams];
declare function submit(value: string): void;

export function Availability({ item, items }: { item?: { name?: string }; items: string[] }) {
  useEffect(() => {
    if (!item) return;
    submit(item.name ?? '');
  }, [item]);
  useEffect(() => {
    if (item == null) return;
    submit(item.name ?? '');
  }, [item]);
  useEffect(() => {
    if (item === undefined) { return; }
    submit(item.name ?? '');
  }, [item]);
  useEffect(() => {
    if (!item?.name) return;
    submit(item.name);
  }, [item]);
  useEffect(() => {
    if (!items.length) return;
    submit(items[0]);
  }, [items]);
  useEffect(() => {
    if (!items[0]) return;
    submit(items[0]);
  }, [items]);
}

export function EarlyReturn() {
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (!query) return;
    submit(query);
  }, [query]);
  return <input value={query} onChange={(event) => setQuery(event.target.value)} />;
}

export function Arrival({ notify, location }: { notify: () => void; location: { search: string } }) {
  const [searchParams] = useSearchParams();
  const [tabParams] = useSearchParams({ tab: 'home' });
  useEffect(() => {
    if (notify && searchParams.get('completed')) {
      notify();
    }
  }, [searchParams, notify]);
  useEffect(() => {
    if (notify && tabParams.has('completed')) {
      notify();
    }
  }, [tabParams, notify]);
  useEffect(() => {
    if (notify && location.search) {
      notify();
    }
  }, [location, notify]);
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
