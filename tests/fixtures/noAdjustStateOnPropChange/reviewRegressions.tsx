import { useEffect, useState } from 'react';

function fill(previous: string | null) {
  return previous ?? 'Untitled';
}

const fillArrow = (previous: string | null) => previous ?? 'Untitled';
const fillExpression = function (previous: string | null) {
  return previous ?? 'Untitled';
};
const EMPTY = null;
const EMPTY_WITH_CALLBACK = { make: () => 'Untitled' };

export function NestedOnlyDependency(props) {
  const page = props.payload;
  const { items } = page.list;
  const [selection, setSelection] = useState<string>();
  useEffect(() => {
    setSelection(items[0]); // expect: noAdjustStateOnPropChange
  }, [items]);
  return <input value={selection} onChange={event => setSelection(event.target.value)} />;
}

export function NamedUpdater({ open }) {
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setDraft(fill);
  }, [open]);
  return <input value={draft ?? ''} onChange={event => setDraft(event.target.value)} />;
}

export function LocalNamedUpdater({ open }) {
  const [draft, setDraft] = useState<string | null>(null);
  function fillLocal(previous: string | null) {
    return previous ?? 'Untitled';
  }
  useEffect(() => {
    if (!open) return;
    setDraft(fillLocal);
  }, [open]);
  return <input value={draft ?? ''} onChange={event => setDraft(event.target.value)} />;
}

export function SelfSeedingDraft({ initialDraft }) {
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => {
    if (draft !== null) return;
    setDraft(initialDraft);
  }, [draft, initialDraft]);
  return <input value={draft ?? ''} onChange={event => setDraft(event.target.value)} />;
}

export function UnguardedDraft({ initialDraft }) {
  const [draft, setDraft] = useState('');
  useEffect(() => {
    setDraft(initialDraft); // expect: noAdjustStateOnPropChange
  }, [initialDraft]);
  return <input value={draft} onChange={event => setDraft(event.target.value)} />;
}

export function ConstantUpdater({ open }) {
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => {
    if (open && draft === null) {
      setDraft(fillArrow);
    }
  }, [open, draft]);
  return <input value={draft ?? ''} onChange={event => setDraft(event.target.value)} />;
}

export function ConstantLiteralReset({ open }) {
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setDraft(EMPTY); // expect: noAdjustStateOnPropChange
  }, [open]);
  return <input value={draft ?? ''} onChange={event => setDraft(event.target.value)} />;
}

export function AsyncAliasOutsideBranch({ items, request, refresh }) {
  const [selection, setSelection] = useState<string>();
  const update = setSelection;
  useEffect(() => {
    if (!items) {
      request.then(value => setSelection(value));
    } else {
      setSelection(items[0]);
    }
    refresh.then(value => update(value));
  }, [items, request, refresh]);
  return <input value={selection} onChange={event => setSelection(event.target.value)} />;
}

export function LocalArrowUpdater({ open }) {
  const [draft, setDraft] = useState<string | null>(null);
  const fillLocal = (previous: string | null) => previous ?? 'Untitled';
  useEffect(() => {
    if (!open) return;
    setDraft(fillLocal);
  }, [open]);
  return <input value={draft ?? ''} onChange={event => setDraft(event.target.value)} />;
}

export function LocalExpressionUpdater({ open }) {
  const [draft, setDraft] = useState<string | null>(null);
  const fillLocal = function (previous: string | null) {
    return previous ?? 'Untitled';
  };
  useEffect(() => {
    if (!open) return;
    setDraft(fillLocal);
  }, [open]);
  return <input value={draft ?? ''} onChange={event => setDraft(event.target.value)} />;
}

export function EffectArrowUpdater({ open }) {
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => {
    const fillEffect = (previous: string | null) => previous ?? 'Untitled';
    if (!open) return;
    setDraft(fillEffect);
  }, [open]);
  return <input value={draft ?? ''} onChange={event => setDraft(event.target.value)} />;
}

export function EffectExpressionUpdater({ open }) {
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => {
    const fillEffect = function (previous: string | null) {
      return previous ?? 'Untitled';
    };
    if (!open) return;
    setDraft(fillEffect);
  }, [open]);
  return <input value={draft ?? ''} onChange={event => setDraft(event.target.value)} />;
}

export function ModuleArrowUpdater({ open }) {
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setDraft(fillArrow);
  }, [open]);
  return <input value={draft ?? ''} onChange={event => setDraft(event.target.value)} />;
}

export function ModuleExpressionUpdater({ open }) {
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setDraft(fillExpression);
  }, [open]);
  return <input value={draft ?? ''} onChange={event => setDraft(event.target.value)} />;
}

export function ObjectLiteralReset({ open }) {
  const [draft, setDraft] = useState(EMPTY_WITH_CALLBACK);
  useEffect(() => {
    if (!open) return;
    setDraft(EMPTY_WITH_CALLBACK); // expect: noAdjustStateOnPropChange
  }, [open]);
  return <button onClick={() => setDraft({ make: () => 'Edited' })}>{draft.make()}</button>;
}
