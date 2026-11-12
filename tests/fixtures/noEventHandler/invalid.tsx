import { useEffect, useState } from 'react';

declare function submitData(data: object): void;
declare function showNotification(message: string): void;

export function Form() {
  const [dataToSubmit, setDataToSubmit] = useState<object | null>(null);
  useEffect(() => {
    if (dataToSubmit) { // expect: noEventHandler
      submitData(dataToSubmit);
    }
  }, [dataToSubmit]);
  return <button type="button" onClick={() => setDataToSubmit({})}>Submit</button>;
}

export function ProductPage({ product }: { product: { isInCart: boolean; name: string } }) {
  useEffect(() => {
    if (product.isInCart) { // expect: noEventHandler
      showNotification(`Added ${product.name} to the shopping cart!`);
    }
  }, [product]);
  return null;
}

export function EarlyReturn() {
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (!query) return; // expect: noEventHandler
    submitData({ query });
  }, [query]);
  return <input value={query} onChange={(event) => setQuery(event.target.value)} />;
}

export function SaveAndTrack() {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  useEffect(() => {
    if (saved) { // expect: noEventHandler
      setToast('Saved'); // expect: noChainStateUpdates
      showNotification('Saved');
    }
  }, [saved]);
  return (
    <button type="button" onClick={() => setSaved(true)}>
      {toast}
    </button>
  );
}

export function GuardedSubmit({ form }: { form: object | null }) {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (!form) return; // expect: noEventHandler
    setSent(true); // expect: noAdjustStateOnPropChange
    submitData(form);
  }, [form]);
  return sent;
}

export function BlockGuard({ zoom }: { zoom: number }) {
  useEffect(() => {
    if (zoom <= 0) { // expect: noEventHandler
      return;
    }
    showNotification(`Zoom ${zoom}`);
  }, [zoom]);
  return null;
}

export function ComparedNotification({ saved }) {
  useCustomCompareEffect(() => {
    if (saved) { // expect: noEventHandler
      showNotification('Saved');
    }
  }, [saved], cmp);
}
