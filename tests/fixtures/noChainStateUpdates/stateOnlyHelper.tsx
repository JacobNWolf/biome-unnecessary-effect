import { useEffect, useState } from 'react';

declare function submit(name: string): void;

export function SaveVersionPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');

  const reset = () => {
    setName('');
  };

  useEffect(() => {
    if (!isOpen) reset(); // expect: noChainStateUpdates
  }, [isOpen]);

  return <button type="button" onClick={() => setIsOpen(true)}>{name}</button>;
}

export function FunctionDeclarationHelper() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName('');
    setError(null);
  }

  useEffect(() => {
    if (step > 3) {
      reset(); // expect: noChainStateUpdates
    }
  }, [step]);

  return <button type="button" onClick={() => setStep((s) => s + 1)}>{name + error}</button>;
}

export function SameStateHelper() {
  const [isOpen, setIsOpen] = useState(false);

  const resetOpen = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) resetOpen();
  }, [isOpen]);

  return <button type="button" onClick={() => setIsOpen(true)}>{String(isOpen)}</button>;
}

export function MixedStateHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');

  const close = () => {
    setIsOpen(false);
    setName('');
  };

  useEffect(() => {
    if (isOpen) close(); // expect: noChainStateUpdates
  }, [isOpen]);

  return <button type="button" onClick={() => setIsOpen(true)}>{name}</button>;
}

export function SideEffectHelper() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const submitAndClear = () => {
    submit(name);
    setName('');
  };

  useEffect(() => {
    if (step > 3) { // expect: noEventHandler
      submitAndClear();
    }
  }, [step]);

  return <button type="button" onClick={() => setStep((s) => s + 1)}>{name}</button>;
}

export function PropTriggeredHelper({ shouldReset }: { shouldReset: boolean }) {
  const [name, setName] = useState('');

  const clear = () => {
    setName('');
  };

  useEffect(() => {
    if (shouldReset) clear();
  }, [shouldReset]);

  return name;
}
