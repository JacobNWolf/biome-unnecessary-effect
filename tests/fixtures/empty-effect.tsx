import { useEffect } from 'react';

export function EmptyEffectComponent() {
  useEffect(() => {}, []);

  return <div>Empty Effect</div>;
}
