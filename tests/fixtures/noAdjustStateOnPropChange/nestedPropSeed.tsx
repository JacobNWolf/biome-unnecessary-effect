import { useEffect, useState } from 'react';

export function NestedPropSeed({ model }) {
  const source = model.resource;
  const data = source.data;
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (!data || seeded) return;
    if (data.ready) {
      setSeeded(true);
    }
  }, [data, seeded]);
  return seeded;
}

export function NestedPropLatch({ model }) {
  const source = model.resource;
  const data = source.data;
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (!data) return;
    if (data.ready) {
      setSeeded(true); // expect: noAdjustStateOnPropChange
    }
  }, [data]);
  return seeded;
}
