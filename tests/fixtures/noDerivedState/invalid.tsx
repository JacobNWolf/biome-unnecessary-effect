import { useEffect, useState } from 'react';

export function Form() {
  const [firstName] = useState('Nick');
  const [lastName] = useState('van Dyke');
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(firstName + ' ' + lastName); // expect: noDerivedState
  }, [firstName, lastName]);
  return fullName;
}

export const Upper = ({ value }: { value: string }) => {
  const [upper, setUpper] = useState('');
  useEffect(() => setUpper(value.toUpperCase()), [value]); // expect: noDerivedState
  return upper;
};

export function FromProps(props: { value: number }) {
  const [doubled, setDoubled] = useState(0);
  useEffect(() => {
    setDoubled(props.value * 2); // expect: noDerivedState
  }, [props.value]);
  return doubled;
}
