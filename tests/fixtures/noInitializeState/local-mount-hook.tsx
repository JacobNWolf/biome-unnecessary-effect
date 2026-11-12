import { useState } from 'react';

function useMount(callback: () => void) {
  callback();
}

const useEffectOnce = (callback: () => void) => callback();

export function Initialize() {
  const [value, setValue] = useState('');
  useMount(() => {
    setValue('x');
  });
  useEffectOnce(() => {
    setValue('y');
  });
  return value;
}
