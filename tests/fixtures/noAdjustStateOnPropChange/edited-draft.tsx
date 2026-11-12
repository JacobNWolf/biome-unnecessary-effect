import { useEffect, useState } from 'react';

export function EditableTitle({ title }: { title: string }) {
  const [draft, setDraft] = useState(title);
  useEffect(() => { // expect: noResetAllStateOnPropChange
    setDraft(title); // expect: noAdjustStateOnPropChange
  }, [title]);
  return <input value={draft} onChange={(event) => setDraft(event.target.value)} />;
}

export function ReorderableItems({ items }: { items: string[] }) {
  const [ordered, setOrdered] = useState<string[]>(items);
  useEffect(() => { // expect: noResetAllStateOnPropChange
    setOrdered(items); // expect: noAdjustStateOnPropChange
  }, [items]);
  return <List items={ordered} onReorder={setOrdered} />;
}

export function EditableAndDerived({ title }: { title: string }) {
  const [draft, setDraft] = useState(title);
  const [label, setLabel] = useState('');
  function reset() {
    setDraft('');
  }
  useEffect(() => {
    setDraft(title); // expect: noAdjustStateOnPropChange
    setLabel(title.toUpperCase()); // expect: noDerivedState, noDerivedStateDeep
  }, [title]);
  return <button onClick={reset}>{draft + label}</button>;
}

declare function List(props: { items: string[]; onReorder: (items: string[]) => void }): null;
