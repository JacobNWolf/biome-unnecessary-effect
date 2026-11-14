import { useEffect, useState } from 'react';
import { useQuery as fetchQuery } from 'data-library';

declare function load(): Promise<string>;
declare function transform(value: string): string;
declare function useQuery(options: { id: string }): { data: string; select(value: string): string };
declare function useGetItems(): (id: string) => string[];

const ALL_ITEMS = ['a', 'b'];

export function PromiseChain({ onError }: { onError: (error: unknown) => void }) {
  const [result, setResult] = useState('');
  useEffect(() => {
    load().then((response) => {
      setResult(response);
    }).catch(onError);
  }, [onError]);
  return result;
}

export function PureInitializer({ value }: { value: string }) {
  const [result, setResult] = useState('');
  const next = transform(value);
  useEffect(() => {
    setResult(next); // expect: noDerivedState, noDerivedStateDeep
  }, [next]);
  return result;
}

export function HookInitializer({ id }: { id: string }) {
  const [result, setResult] = useState('');
  const query = useQuery({ id });
  const selected = query.select(id);
  useEffect(() => {
    setResult(query.data); // expect: noDerivedState
  }, [query.data]);
  useEffect(() => {
    setResult(selected); // expect: noDerivedState
  }, [selected]);
  return result;
}

export function CleanupWriter({ value }: { value: string }) {
  const [result, setResult] = useState('');
  useEffect(() => {
    setResult(value); // expect: noDerivedState
  }, [value]);
  useEffect(() => {
    setResult('external'); // expect: noExternalStoreSubscription
    return () => setResult('');
  }, []);
  return result;
}

export function AsyncWriter({ value }: { value: string }) {
  const [result, setResult] = useState('');
  useEffect(() => {
    setResult(value); // expect: noDerivedState
  }, [value]);
  useEffect(() => {
    load().then((response) => setResult(response));
  }, []);
  return result;
}

export function NamedAsyncWriter({ value }: { value: string }) {
  const [result, setResult] = useState('');
  useEffect(() => {
    setResult(value); // expect: noDerivedState
  }, [value]);
  useEffect(() => {
    const receive = (response: string) => setResult(response);
    load().then(receive);
  }, []);
  return result;
}

export function RenamedQuery({ id }: { id: string }) {
  const [result, setResult] = useState('');
  const query = fetchQuery({ id });
  useEffect(() => {
    setResult(query.data); // expect: noDerivedState
  }, [query.data]);
  return result;
}

export function DestructuredHookMethod({ id }: { id: string }) {
  const [result, setResult] = useState('');
  const { select } = useQuery({ id });
  const selected = select(id);
  useEffect(() => {
    setResult(selected); // expect: noDerivedState
  }, [selected]);
  return result;
}

export function HookReturnedFunction({ id }: { id: string }) {
  const [result, setResult] = useState<string[]>([]);
  const getItems = useGetItems();
  const items = getItems(id);
  useEffect(() => {
    setResult(items); // expect: noDerivedState
  }, [items]);
  return result;
}

export function AssignedPromiseWriter({ value }: { value: string }) {
  const [result, setResult] = useState('');
  useEffect(() => {
    setResult(value); // expect: noDerivedState
  }, [value]);
  useEffect(() => {
    const pending = load().then((response) => setResult(response));
    void pending;
  }, []);
  return result;
}

export function HelperAsyncWriter({ value }: { value: string }) {
  const [result, setResult] = useState('');
  const syncFromServer = () => {
    load().then((response) => setResult(response));
  };
  useEffect(() => {
    setResult(value); // expect: noAdjustStateOnPropChange
  }, [value]);
  useEffect(() => {
    syncFromServer();
  }, []);
  return result;
}

export function NamedEffectAsyncWriter({ value }: { value: string }) {
  const [result, setResult] = useState('');
  const asyncEffect = () => {
    load().then((response) => setResult(response));
  };
  useEffect(() => {
    setResult(value); // expect: noAdjustStateOnPropChange
  }, [value]);
  useEffect(asyncEffect, []);
  return result;
}

export function SelfReadInCallback({ items }: { items: string[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    setSelected(items.filter((item) => !selected.includes(item)));
  }, [items, selected]);
  return selected;
}

export function DerivedReadInCallback() {
  const [query] = useState('');
  const [filtered, setFiltered] = useState<string[]>([]);
  useEffect(() => {
    setFiltered(ALL_ITEMS.filter((item) => item.includes(query))); // expect: noDerivedState, noDerivedStateDeep
  }, [query]);
  return filtered;
}
