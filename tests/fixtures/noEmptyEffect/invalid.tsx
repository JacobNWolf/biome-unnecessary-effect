import { useEffect } from 'react';

export function EmptyEffectComponent() {
  useEffect(() => {}, []); // expect: noEmptyEffect

  return <div>Empty Effect</div>;
}
