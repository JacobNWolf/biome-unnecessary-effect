import { useEffect } from 'react';

export function EmptyEffectComponent() {
  // biome-ignore lint/plugin/noEmptyEffect: This comment should suppress the empty effect warning
  useEffect(() => {}, []);

  return <div>Empty Effect</div>;
}
