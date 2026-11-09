import { useEffect, useState } from 'react';

export function useSelection({ items }: { items: string[] }) {
  const [selection, setSelection] = useState<string | null>(null);
  useEffect(() => {
    setSelection(null); // expect: noAdjustStateOnPropChange
  }, [items]);
  return selection;
}
