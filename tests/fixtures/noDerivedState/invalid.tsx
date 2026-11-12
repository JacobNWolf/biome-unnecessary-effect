import { useEffect, useState } from 'react';

export function Form() {
  const [firstName] = useState('Nick');
  const [lastName] = useState('van Dyke');
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(firstName + ' ' + lastName); // expect: noDerivedState, noDerivedStateDeep
  }, [firstName, lastName]);
  return fullName;
}

export const Upper = ({ value }: { value: string }) => {
  const [upper, setUpper] = useState('');
  useEffect(() => setUpper(value.toUpperCase()), [value]); // expect: noDerivedState, noDerivedStateDeep
  return upper;
};

export function FromProps(props: { value: number }) {
  const [doubled, setDoubled] = useState(0);
  useEffect(() => {
    setDoubled(props.value * 2); // expect: noDerivedState, noDerivedStateDeep
  }, [props.value]);
  return doubled;
}

export function Defaulted({ count }: { count: number }) {
  const [doubleCount = 0, setDoubleCount] = useState(0);
  useEffect(() => {
    setDoubleCount(count * 2); // expect: noDerivedState, noDerivedStateDeep
  }, [count]);
  return doubleCount;
}

export function ValueLess() {
  const [, setAttempts] = useState(0);
  const [count] = useState(0);
  useEffect(() => {
    setAttempts((prev) => prev + count); // expect: noDerivedState, noDerivedStateDeep
  }, [count]);
}

export function Asserted() {
  const [count] = useState(0) as [number, (v: number) => void];
  const [doubleCount, setDoubleCount] = useState(0) as [number, (v: number) => void];
  useEffect(() => {
    setDoubleCount(count * 2); // expect: noDerivedState, noDerivedStateDeep
  }, [count]);
  return doubleCount;
}

export function NoInitialValue({ value }: { value: string }) {
  const [upper, setUpper] = useState();
  useEffect(() => setUpper(value.toUpperCase()), [value]); // expect: noDerivedState, noDerivedStateDeep
  return upper;
}

export function DefaultedSource() {
  const [count = 0, setCount] = useState(0);
  const [direct, setDirect] = useState(0);
  const [indirect, setIndirect] = useState(0);
  const next = count * 2;
  useEffect(() => {
    setDirect(count * 2); // expect: noDerivedState, noDerivedStateDeep
    setIndirect(next); // expect: noDerivedState, noDerivedStateDeep
  }, [count, next]);
  return [direct, indirect, setCount];
}

export function DirectAlias() {
  const [data, setData] = useState();
  const setDataWrapper = setData;
  useEffect(() => {
    setDataWrapper(data); // expect: noDerivedState, noDerivedStateDeep
  }, [data]);
}

export function CompareProp({ value }) {
 const [result, setResult] = useState("");
 useCustomCompareEffect(() => {
  setResult(value); // expect: noDerivedState, noDerivedStateDeep
 }, [value], cmp);
 return result;
}
export function SecondPost({ posts }) {
 const [secondPost, setSecondPost] = useState();
 useEffect(() => {
  const [, second] = posts;
  setSecondPost(second); // expect: noDerivedState, noDerivedStateDeep
 }, [posts]);
 return secondPost;
}
