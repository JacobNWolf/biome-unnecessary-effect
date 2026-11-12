import { useEffect, useState } from 'react';

export function List({ items }: { items: string[] }) {
  const [isReverse] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);
  useEffect(() => {
    setSelection(null); // expect: noAdjustStateOnPropChange
  }, [items]);
  return `${isReverse}${selection}`;
}

export function ComparedList({ items }) {
  const [selection, setSelection] = useState(null);
  useCustomCompareEffect(() => {
    setSelection(null); // expect: noAdjustStateOnPropChange
  }, [items], cmp);
  return selection;
}
