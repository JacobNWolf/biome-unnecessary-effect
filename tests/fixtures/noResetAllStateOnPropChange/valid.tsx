import { useEffect, useState } from 'react';

export function useSelection({ items }: { items: string[] }) {
  const [selection, setSelection] = useState<string | null>(null);
  useEffect(() => {
    setSelection(null); // expect: noAdjustStateOnPropChange
  }, [items]);
  return selection;
}

export function DifferentAssertedReset({ id }) {
 const [user, setUser] = useState(null as string | null);
 useEffect(() => {
  setUser("other"); // expect: noAdjustStateOnPropChange
 }, [id]);
 return user;
}
