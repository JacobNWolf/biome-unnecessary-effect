import { useEffect } from 'react';

export function ParentChildCouplingComponent({ onRender }: { onRender: () => void }) {
  useEffect(() => {
    onRender();
  }, [onRender]);

  return <div>Parent Child Coupling</div>;
}
