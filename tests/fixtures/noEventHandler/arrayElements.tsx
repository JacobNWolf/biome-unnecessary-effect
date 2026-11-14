import { useEffect } from 'react';

export function UnrelatedElement(props) {
  const [local] = [true, props.id];
  useEffect(() => {
    if (local) {
      console.log('ready');
    }
  }, [local]);
}

export function UnrelatedEffectElement(props) {
  useEffect(() => {
    const [local] = [true, props.id];
    if (local) {
      console.log('ready');
    }
  }, [props.id]);
}

export function SingleElement(props) {
  const [local] = [props.id];
  useEffect(() => {
    if (local) { // expect: noEventHandler
      console.log('ready');
    }
  }, [local]);
}
