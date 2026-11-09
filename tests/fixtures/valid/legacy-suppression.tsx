import { useEffect, useState } from 'react';

export function Suppressed({ value }: { value: string }) {
  const [copy, setCopy] = useState('');
  useEffect(() => {
    // biome-ignore lint/plugin/noDerivedState: path-based plugins are named after the rule file
    setCopy(value); // expect: noDerivedStateDeep
  }, [value]);
  return copy;
}
