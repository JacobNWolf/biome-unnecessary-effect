import { useEffect, useState } from 'react';

declare function format(value: string): string;
declare function useEditorContext(): { id: string; value: string };

export function SeededFromProp({ value }) {
  const [seen, setSeen] = useState('');
  useEffect(() => {
    if (seen) return;
    setSeen(value);
  }, [seen, value]);
  return <button onClick={() => setSeen('clicked')}>{seen}</button>;
}

export function SeededFromShadowedProp({ items, value }) {
  const [seen, setSeen] = useState('');
  useEffect(() => {
    if (seen) return;
    const value = items[0];
    setSeen(value);
  }, [seen, items]);
  return <button onClick={() => setSeen('clicked')}>{seen}</button>;
}

export function SeededFromShadowedAlias(props) {
  const [seen, setSeen] = useState('');
  const value = props?.value;
  const items = props.items;
  useEffect(() => {
    if (seen) return;
    const value = items[0];
    setSeen(value);
  }, [seen, items]);
  return <button onClick={() => setSeen('clicked')}>{seen}</button>;
}

export function ShadowedTriggerName({ id, value }) {
  const [draft, setDraft] = useState('');
  useEffect(() => {
    const value = format(id);
    setDraft(value); // expect: noAdjustStateOnPropChange
  }, [id, value]);
  return <input value={draft} onChange={event => setDraft(event.target.value)} />;
}

export function AdjustedFromProp({ value }) {
  const [draft, setDraft] = useState('');
  useEffect(() => {
    setDraft(value); // expect: noAdjustStateOnPropChange
  }, [value]);
  return <input value={draft} onChange={event => setDraft(event.target.value)} />;
}

export function ShadowedNestedAlias(props) {
  const [draft, setDraft] = useState('');
  const model = props.model;
  const value = model.value;
  const id = props.id;
  useEffect(() => {
    const value = format(id);
    setDraft(value); // expect: noAdjustStateOnPropChange
  }, [id, value]);
  return <input value={draft} onChange={event => setDraft(event.target.value)} />;
}

export function ShadowedCustomContext() {
  const [draft, setDraft] = useState('');
  const { id, value } = useEditorContext();
  useEffect(() => {
    const value = format(id);
    setDraft(value); // expect: noAdjustStateOnPropChange
  }, [id, value]);
  return <input value={draft} onChange={event => setDraft(event.target.value)} />;
}

export function ShadowedNestedSource(props) {
  const [draft, setDraft] = useState('');
  const config = props.config;
  {
    const config = { name: 'fixed' };
    const label = config.name;
    useEffect(() => {
      setDraft(label);
    }, [label]);
  }
  return <input value={draft} onChange={event => setDraft(event.target.value)} />;
}

export function UnshadowedNestedSource(props) {
  const [draft, setDraft] = useState('');
  const config = props.config;
  {
    const label = config.name;
    useEffect(() => {
      setDraft(label); // expect: noAdjustStateOnPropChange
    }, [label]);
  }
  return <input value={draft} onChange={event => setDraft(event.target.value)} />;
}

declare const defaults: { group: { item: string } };

export function ShadowedNestedPropRoot(props) {
  const [selected, setSelected] = useState('');
  {
    const props = defaults;
    const group = props.group;
    const item = group.item;
    useEffect(() => {
      setSelected(item);
    }, [item]);
  }
  return <input value={selected} onChange={event => setSelected(event.target.value)} />;
}

export function UnshadowedNestedPropRoot(props) {
  const [selected, setSelected] = useState('');
  {
    const group = props.group;
    const item = group.item;
    useEffect(() => {
      setSelected(item); // expect: noAdjustStateOnPropChange
    }, [item]);
  }
  return <input value={selected} onChange={event => setSelected(event.target.value)} />;
}
