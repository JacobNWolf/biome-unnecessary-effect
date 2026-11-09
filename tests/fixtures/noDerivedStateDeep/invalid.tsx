import { useEffect, useEffect as useFx, useState } from 'react';

// GritQL follows one hop through local variables; only the TypeScript rule follows setter aliases and helper calls.
export function Form({ title }: { title: string }) {
  const [firstName] = useState('Nick');
  const [lastName] = useState('van Dyke');
  const [fullName, setFullName] = useState('');
  const name = `${firstName} ${lastName}`;
  const computeName = () => `${title} ${name}`;

  useEffect(() => {
    const next = `${title} ${firstName}`;
    setFullName(next); // expect: noDerivedStateDeep, noDerivedState
  }, [title, firstName]);

  useEffect(() => {
    setFullName(computeName()); // expect: noDerivedStateDeep, noDerivedState
  }, [computeName]);

  useEffect(() => {
    const update = setFullName;
    update(name); // expect: noDerivedStateDeep
  }, [name]);

  useEffect(() => {
    function apply() {
      setFullName(lastName);
    }
    apply(); // expect: noDerivedStateDeep
  }, [lastName]);

  // Renamed imports need the semantic model.
  useFx(() => {
    setFullName(title); // expect: noDerivedStateDeep
  }, [title]);

  return fullName;
}
