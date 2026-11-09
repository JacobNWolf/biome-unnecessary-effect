import { useEffect, useLayoutEffect } from 'react';

export function EmptyEffects() {
  useEffect(() => {}, []); // expect: noEmptyEffect
  useEffect(() => {}); // expect: noEmptyEffect
  useEffect(function () {}, []); // expect: noEmptyEffect
  useLayoutEffect(() => {}, []); // expect: noEmptyEffect
  return null;
}
