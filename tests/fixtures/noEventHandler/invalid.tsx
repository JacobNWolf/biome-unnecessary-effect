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
