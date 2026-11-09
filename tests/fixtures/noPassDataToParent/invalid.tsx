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
