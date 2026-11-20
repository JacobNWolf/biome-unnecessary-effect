import { useEffect, useState } from 'react';
import document from 'records';

export function ImportedDocument() {
  const [name, setName] = useState('');
  useEffect(() => {
    setName(document.name); // expect: noInitializeState
  }, []);
  return name;
}
