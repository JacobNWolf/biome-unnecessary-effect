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

export function HelperWithStateArgument() {
  const [source] = useState('');
  const [name, setName] = useState('');
  const apply = (next: string) => {
    setName(next);
  };

  useEffect(() => {
    apply(source); // expect: noDerivedStateDeep
  }, [source]);

  return name;
}

export function OneShotHelper() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [name, setName] = useState('');
  const initialize = () => {
    setName('ready');
    setIsInitialized(true);
  };

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized]);

  return name;
}

export function HelperWithBothStatesInDeps() {
  const [flag, setFlag] = useState(true);
  const [other] = useState(0);
  const reset = () => {
    setFlag(false);
  };

  useEffect(() => {
    reset(); // expect: noChainStateUpdates
  }, [flag, other]);

  return flag;
}

export function HelperWithLiteralArgument() {
  const [step] = useState(0);
  const [name, setName] = useState('');
  const reset = (next: string) => {
    setName(next);
  };

  useEffect(() => {
    reset(''); // expect: noChainStateUpdates
  }, [step]);

  return name;
}

export function HelperWithUnusedStateArgument() {
  const [source] = useState('');
  const [name, setName] = useState('');
  const reset = (_next: string) => {
    setName('');
  };

  useEffect(() => {
    reset(source); // expect: noChainStateUpdates, noDerivedStateDeep
  }, [source]);

  return name;
}

export function HelperWithDerivedAndResetUpdates() {
  const [source] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const reset = (next: string) => {
    setName(next);
    setError(null);
  };

  useEffect(() => {
    reset(source); // expect: noChainStateUpdates, noDerivedStateDeep
  }, [source]);

  return name + error;
}

export function OptionalOneShotFunctionHelper() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [name, setName] = useState('');
  function initialize() {
    setName('ready');
    setIsInitialized(true);
  }

  useEffect(() => {
    if (!isInitialized) initialize?.();
  }, [isInitialized]);

  return name;
}

export function HelperWithExternallyResetLatch() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [name, setName] = useState('');
  const initialize = () => {
    setName('ready');
    setIsInitialized(true);
  };

  useEffect(() => {
    if (!isInitialized) initialize(); // expect: noChainStateUpdates
  }, [isInitialized]);

  return <button type="button" onClick={() => setIsInitialized(false)}>{name}</button>;
}

export function HelperWithAliasedStateArgument() {
  const [source] = useState('');
  const [name, setName] = useState('');
  const apply = (next: string) => {
    const value = next;
    setName(value);
  };

  useEffect(() => {
    apply(source); // expect: noDerivedStateDeep
  }, [source]);

  return name;
}

export function HelperWithComputedStateArgument() {
  const [source] = useState('');
  const [name, setName] = useState('');
  function apply(next: string) {
    const value = next.trim();
    setName(value);
  }

  useEffect(() => {
    apply?.(source); // expect: noDerivedStateDeep
  }, [source]);

  return name;
}

export function HelperWithLiteralAliasReset() {
  const [source] = useState('');
  const [name, setName] = useState('');
  const reset = (_next: string) => {
    const value = '';
    setName(value);
  };

  useEffect(() => {
    reset(source); // expect: noChainStateUpdates, noDerivedStateDeep
  }, [source]);

  return name;
}

export function BrowserWritingHelper() {
  const [step] = useState(0);
  const [name, setName] = useState('');
  const reset = () => {
    document.title = '';
    setName('');
  };

  useEffect(() => {
    reset();
  }, [step]);

  return name;
}

export function ShadowedBrowserWritingHelper() {
  const document = { title: '' };
  const [step] = useState(0);
  const [name, setName] = useState('');
  const reset = () => {
    document.title = '';
    setName('');
  };

  useEffect(() => {
    reset(); // expect: noChainStateUpdates
  }, [step]);

  return name;
}
