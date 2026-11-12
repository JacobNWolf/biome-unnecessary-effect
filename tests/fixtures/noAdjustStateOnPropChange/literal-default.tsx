import { useEffect, useState } from 'react';

export function Menu({ disabled = false }: { disabled?: boolean }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (disabled) setOpen(false); // expect: noAdjustStateOnPropChange
  }, [disabled]);
  return null;
}

export function Counter() {
  const [trueCount] = useState(0);
  const [label, setLabel] = useState('');
  useEffect(() => {
    setLabel(String(trueCount)); // expect: noDerivedState, noDerivedStateDeep
  }, [trueCount]);
  return label;
}
