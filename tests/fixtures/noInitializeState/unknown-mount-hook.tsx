import { useState } from 'react';
import { useEffectOnce, useMount } from 'some-unknown-library';

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
