import { useEffect, useState } from 'react';

const fill = previous => previous ?? 'Untitled';
const FILL = fill;
const FILL_AGAIN = FILL;
const EMPTY = null;

export function AliasedUpdater({ open }) {
  const [draft, setDraft] = useState('');
  useEffect(() => {
    if (!open) return;
    setDraft(FILL);
  }, [open]);
  return <input value={draft} onChange={event => setDraft(event.target.value)} />;
}

export function ConstantReplacement({ open }) {
  const [draft, setDraft] = useState('');
  useEffect(() => {
    if (!open) return;
    setDraft(EMPTY); // expect: noAdjustStateOnPropChange
  }, [open]);
  return <input value={draft} onChange={event => setDraft(event.target.value)} />;
}

export function ChainedUpdaterAlias({ open }) {
  const [draft, setDraft] = useState('');
  useEffect(() => {
    if (!open) return;
    setDraft(FILL_AGAIN);
  }, [open]);
  return <input value={draft} onChange={event => setDraft(event.target.value)} />;
}

export function ShadowedAsyncAlias({ value, task }) {
  const [current, setValue] = useState('');
  const update = setValue;
  useEffect(() => {
    task.then(update => console.log(update));
    setValue(value); // expect: noAdjustStateOnPropChange
  }, [value, task]);
  return <input value={current} onChange={event => setValue(event.target.value)} />;
}

export function UnshadowedAsyncAlias({ value, task }) {
  const [current, setValue] = useState('');
  const update = setValue;
  useEffect(() => {
    task.then(result => update(result));
    setValue(value);
  }, [value, task]);
  return <input value={current} onChange={event => setValue(event.target.value)} />;
}

export function ShadowedReturnedAsyncAlias({ value, task }) {
  const [current, setValue] = useState('');
  const update = setValue;
  useEffect(() => {
    task.then(update => update);
    setValue(value); // expect: noAdjustStateOnPropChange
  }, [value, task]);
  return <input value={current} onChange={event => setValue(event.target.value)} />;
}

export function ShadowedBlockAsyncAlias({ value, task }) {
  const [current, setValue] = useState('');
  const update = setValue;
  useEffect(() => {
    task.then(() => {
      const update = console.log;
      update('done');
    });
    setValue(value); // expect: noAdjustStateOnPropChange
  }, [value, task]);
  return <input value={current} onChange={event => setValue(event.target.value)} />;
}

export function SiblingShadowDoesNotHideAsyncAlias({ value, task }) {
  const [current, setValue] = useState('');
  const update = setValue;
  useEffect(() => {
    task.then(result => {
      if (result) {
        const update = console.log;
        update(result);
      }
      update(result);
    });
    setValue(value);
  }, [value, task]);
  return <input value={current} onChange={event => setValue(event.target.value)} />;
}

export function PassedAsyncAlias({ value, task }) {
  const [current, setValue] = useState('');
  const update = setValue;
  useEffect(() => {
    task.then(update);
    setValue(value);
  }, [value, task]);
  return <input value={current} onChange={event => setValue(event.target.value)} />;
}

export function MultipleSetterAliases({ value, task }) {
  const [current, setValue] = useState('');
  const unused = setValue;
  const update = setValue;
  useEffect(() => {
    task.then(result => update(result));
    setValue(value);
  }, [value, task]);
  return <input value={current} onChange={event => setValue(event.target.value)} />;
}

export function SelfGuardedDerivedWrite({ items, advance }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count === 0) {
      setCount(items.length);
    }
    if (advance) {
      setCount(0); // expect: noAdjustStateOnPropChange
    }
  }, [count, items, advance]);
  return count;
}

export function EligibleDerivedWrite({ items, advance }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count !== items.length) {
      setCount(items.length); // expect: noDerivedState, noDerivedStateDeep
    }
    if (advance) {
      setCount(0);
    }
  }, [count, items, advance]);
  return count;
}
