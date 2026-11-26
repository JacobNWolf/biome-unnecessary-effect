import { useEffect } from 'react';

declare const enabled: boolean;
declare function consume(value: boolean): void;
declare function submit(): void;
declare function useOtherModel(): { setValue: (value: number) => void };
declare function useModel(): { setValue: (value: number) => void };
declare function setValue(value: number): void;

export function InaccessibleAlias({ active }) {
  {
    const enabled = active;
    consume(enabled);
  }
  useEffect(() => {
    if (enabled) submit();
  }, [enabled]);
}

export function VisibleAlias({ active }) {
  const enabled = active;
  useEffect(() => {
    if (enabled) submit(); // expect: noEventHandler
  }, [enabled]);
}

export function EnclosingBlockAlias({ active }) {
  {
    const enabled = active;
    useEffect(() => {
      if (enabled) submit(); // expect: noEventHandler
    }, [enabled]);
  }
}

export function VisibleSetterAfterInaccessibleSetter({ active }) {
  {
    const { setValue } = useOtherModel();
    setValue(0);
  }
  const { setValue } = useModel();
  useEffect(() => {
    if (active) setValue(1);
  }, [active]);
}

export function InaccessibleSetterOnly({ active }) {
  {
    const { setValue } = useOtherModel();
    setValue(0);
  }
  useEffect(() => {
    if (active) setValue(1); // expect: noEventHandler
  }, [active]);
}

export function AbstractMethodParameter({ active }) {
  useEffect(() => {
    abstract class Sink {
      abstract run(active: boolean): void;
    }
    if (active) submit(); // expect: noEventHandler
  }, [active]);
}

export function GetterLocalVar({ active }) {
  useEffect(() => {
    class Sink {
      get value() {
        var active = false;
        void active;
      }
    }
    if (active) submit(); // expect: noEventHandler
  }, [active]);
}

export function ExecutableMethodParameter({ active }) {
  useEffect(() => {
    class Sink {
      run(active: boolean) {
        if (active) submit();
      }
    }
  }, [active]);
}
