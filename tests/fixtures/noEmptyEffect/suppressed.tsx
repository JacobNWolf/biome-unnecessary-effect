import { useEffect } from 'react';

export function Suppressed() {
  // biome-ignore lint/plugin/noEmptyEffect: placeholder kept on purpose
  useEffect(() => {}, []);
  return null;
}
