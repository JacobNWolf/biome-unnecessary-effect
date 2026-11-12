import { useEffect, useState } from 'react';

declare function useQuery(key: string): { data: unknown };
declare function useSomeAPI(): unknown;

export function Child({ onDataFetched }: { onDataFetched: (data: unknown) => void }) {
  const { data } = useQuery('/data');
  useEffect(() => {
    onDataFetched(data); // expect: noPassDataToParent
  }, [data, onDataFetched]);
  return null;
}

export const useCustomHook = ({ onFetched }: { onFetched: (data: unknown) => void }) => {
  const data = useSomeAPI();
  useEffect(() => {
    onFetched(data); // expect: noPassDataToParent
  }, [onFetched, data]);
};

export function Counter({ onChanged }: { onChanged: (data: unknown, count: number) => void }) {
  const [count] = useState(0);
  const data = useSomeAPI();
  useEffect(() => {
    onChanged(data, count); // expect: noPassDataToParent, noPassLiveStateToParent
  }, [onChanged, data, count]);
  return null;
}

declare function useDebounce<T>(value: T, delay: number): T;
declare function useUser(id: string): unknown;

// A debounced copy of local state is live state, not fetched data.
export function WidthInput({ onWidthChange }: { onWidthChange: (width: number) => void }) {
  const [width] = useState(100);
  const debouncedWidth = useDebounce(width, 250);
  useEffect(() => {
    onWidthChange(debouncedWidth); // expect: noPassLiveStateToParent
  }, [debouncedWidth, onWidthChange]);
  return null;
}

// A hook fed a prop still fetches data.
export function UserLoader({ id, onLoad }: { id: string; onLoad: (user: unknown) => void }) {
  const user = useUser(id);
  useEffect(() => {
    onLoad(user); // expect: noPassDataToParent
  }, [user, onLoad]);
  return null;
}

export function DestructuredProps(props: { onFetched: (data: unknown) => void; label: string }) {
  const { onFetched, label } = props;
  const data = useSomeAPI();
  useEffect(() => {
    onFetched(data); // expect: noPassDataToParent
  }, [data, onFetched]);
  return label;
}

export function LocalWrapper({ onFetched }: { onFetched: (data: unknown) => void }) {
  const wrapped = (value: unknown) => onFetched(value);
  const data = useSomeAPI();
  useEffect(() => {
    wrapped(data); // expect: noPassDataToParent
  }, [data, wrapped]);
}

export function FirstData({ onFetched }) {
 const data = useSomeAPI();
 const first = data[0];
 useEffect(() => {
  onFetched(first); // expect: noPassDataToParent
 }, [first, onFetched]);
}

export function AssertedDataCallback({ onFetched }) {
  const data = useSomeAPI();
  useCustomCompareEffect(() => {
    onFetched!(data); // expect: noPassDataToParent
  }, [data, onFetched], cmp);
}

export function AssertedDataProps(props) {
  const data = useSomeAPI();
  useEffect(() => {
    (props as any).onFetched(data); // expect: noPassDataToParent
  }, [data, props]);
}
