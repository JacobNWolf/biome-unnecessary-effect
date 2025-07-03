import { useEffect, useState } from 'react';

export function EventHandlerEffectComponent() {
  const [shouldFire, setShouldFire] = useState(false);

  useEffect(() => {
    if (shouldFire) {
      console.log('fired');
    }
  }, [shouldFire]);

  return (
    <button type="button" onClick={() => setShouldFire(true)}>
      Fire
    </button>
  );
}
