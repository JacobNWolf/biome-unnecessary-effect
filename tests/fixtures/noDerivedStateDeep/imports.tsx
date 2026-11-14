import { useState as stateUser, useEffect as effectUser } from 'preact/hooks';
import * as ReactAlias from 'react';
import { useContext as useCtx, memo, useState, useEffect } from 'react';
import deepEffect from 'use-deep-compare-effect';
import { useDeepCompareEffect } from './hooks';

export function Renamed({ count }) {
  const [value, setValue] = stateUser(0);
  effectUser(() => {
    setValue(count); // expect: noDerivedStateDeep
  }, [count]);
  return value;
}

export function Namespace({ count }) {
  const [value, setValue] = ReactAlias.useState(0);
  ReactAlias.useEffect(() => {
    setValue(count); // expect: noDerivedStateDeep
  }, [count]);
  return value;
}

export function Context() {
  const count = useCtx(CountContext);
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(count); // expect: noDerivedStateDeep
  }, [count]);
  return value;
}

export const Memo = memo(({ count }) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(count); // expect: noDerivedStateDeep, noDerivedState
  }, [count]);
  return value;
});

export function DefaultWrapper({ count }) {
  const [value, setValue] = useState(0);
  deepEffect(() => {
    setValue(count); // expect: noDerivedStateDeep
  }, [count]);
  return value;
}

export function LocalWrapper({ count }) {
  const [value, setValue] = useState(0);
  useDeepCompareEffect(() => {
    setValue(count); // expect: noDerivedState
  }, [count]);
  return value;
}
