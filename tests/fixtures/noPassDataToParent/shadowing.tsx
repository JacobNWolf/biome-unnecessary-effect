import { useEffect } from 'react';

declare function useSomeAPI(): string;
declare function persist(value: string): void;
declare const handlers: { persist: typeof persist };
declare const senders: (typeof persist)[];

export function LocalAlias(props) {
  const data = useSomeAPI();
  const send = props.onChange;
  useEffect(() => {
    const send = persist;
    send(data);
  }, [data, send]);
}

export function OptionalLocalAlias(props) {
  const data = useSomeAPI();
  const send = props?.onChange;
  useEffect(() => {
    const send = persist;
    send(data);
  }, [data, send]);
}

export function DestructuredAlias(props) {
  const data = useSomeAPI();
  const send = props.onChange;
  useEffect(() => {
    const { persist: send } = handlers;
    send(data);
  }, [data, send]);
}

export function ParameterBinding(props) {
  const data = useSomeAPI();
  const send = props.onChange;
  useEffect(() => {
    senders.forEach(send => send(data));
  }, [data, send]);
}

export function OuterAlias(props) {
  const data = useSomeAPI();
  const send = props.onChange;
  useEffect(() => {
    send(data); // expect: noPassDataToParent
  }, [data, send]);
}

export function OptionalOuterAlias(props) {
  const data = useSomeAPI();
  const send = props?.onChange;
  useEffect(() => {
    send(data); // expect: noPassDataToParent
  }, [data, send]);
}

declare const localProps: { onData: typeof persist };

export function IdenticalDeclaration(props) {
  const data = useSomeAPI();
  const notify = props.onData;
  useEffect(() => {
    const props = localProps;
    const notify = props.onData;
    notify(data);
  }, [data, notify]);
}

export function IdenticalSiblingDeclaration(props) {
  const data = useSomeAPI();
  const notify = props.onData;
  useEffect(() => {
    {
      const props = localProps;
      const notify = props.onData;
      notify(data);
    }
    notify(data); // expect: noPassDataToParent
  }, [data, notify]);
}

declare const notify: typeof persist;

export function InaccessibleAlias({ onData }) {
  const data = useSomeAPI();
  {
    const notify = onData;
    notify('ready');
  }
  useEffect(() => {
    notify(data);
  }, [data]);
}

export function SiblingClassMethod({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    class Formatter {
      format(onData) {}
    }
    onData(data); // expect: noPassDataToParent
  }, [data, onData]);
}

export function SiblingClassMethodVar({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    class Formatter {
      format() {
        var onData = persist;
      }
    }
    onData(data); // expect: noPassDataToParent
  }, [data, onData]);
}

export function ShadowedWrapper({ onData }) {
  const data = useSomeAPI();
  const notify = value => {
    const onData = persist;
    onData(value);
  };
  useEffect(() => {
    notify(data);
  }, [data, notify]);
}

export function PropWrapper({ onData }) {
  const data = useSomeAPI();
  const notify = value => {
    onData(value);
  };
  useEffect(() => {
    notify(data); // expect: noPassDataToParent
  }, [data, notify]);
}

export function TypeOnlySetterParameter({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    type Sink = { set value(onData: number); };
    onData(data); // expect: noPassDataToParent
  }, [data, onData]);
}

export function SiblingClassSetter({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    class Sink {
      set value(onData) {}
    }
    onData(data); // expect: noPassDataToParent
  }, [data, onData]);
}

export function SiblingClassConstructor({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    class Sink {
      constructor(onData) {}
    }
    onData(data); // expect: noPassDataToParent
  }, [data, onData]);
}

export function SiblingClassSetterVar({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    class Sink {
      set value(value) {
        var onData = persist;
      }
    }
    onData(data); // expect: noPassDataToParent
  }, [data, onData]);
}

export function SiblingClassConstructorVar({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    class Sink {
      constructor() {
        var onData = persist;
      }
    }
    onData(data); // expect: noPassDataToParent
  }, [data, onData]);
}

export function SiblingClassStaticBlock({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    class Sink {
      static {
        var onData = persist;
      }
    }
    onData(data); // expect: noPassDataToParent
  }, [data, onData]);
}

export function AbstractSetterParameter({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    abstract class Sink {
      abstract set value(onData: number);
    }
    onData(data); // expect: noPassDataToParent
  }, [data, onData]);
}

export function ExecutableClassBindings({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    class Sink {
      constructor(onData) {
        onData(data);
      }
      set value(onData) {
        onData(data);
      }
      static {
        var onData = persist;
        onData(data);
      }
    }
  }, [data, onData]);
}

export function ShadowedAliasInitializer(props) {
  const data = useSomeAPI();
  {
    const props = localProps;
    const notify = props.onData;
    useEffect(() => {
      notify(data);
    }, [data, notify]);
  }
}

export function ShadowedArrayAliasInitializer(props) {
  const data = useSomeAPI();
  {
    const props = localProps;
    const [notify] = [props.onData];
    useEffect(() => {
      notify(data);
    }, [data, notify]);
  }
}

export function PropArrayAliasInitializer(props) {
  const data = useSomeAPI();
  const [notify] = [props.onData];
  useEffect(() => {
    notify(data); // expect: noPassDataToParent
  }, [data, notify]);
}

export function FartherBindingOutsideAlias(props) {
  const data = useSomeAPI();
  {
    const notify = persist;
    {
      const notify = props.onData;
      useEffect(() => {
        notify(data); // expect: noPassDataToParent
      }, [data, notify]);
    }
  }
}

export function CloserBindingInsideAlias(props) {
  const data = useSomeAPI();
  {
    const notify = persist;
    {
      const notify = props.onData;
      useEffect(() => {
        const notify = persist;
        notify(data);
      }, [data, notify]);
    }
  }
}

export function ParameterInitializerBeforeBodyVar({ onData }) {
  const data = useSomeAPI();
  const notify = (value, ignored = onData(value)) => {
    var onData = persist;
  };
  useEffect(() => {
    notify(data); // expect: noPassDataToParent
  }, [data, notify]);
}

export function FunctionParameterInitializerBeforeBodyVar({ onData }) {
  const data = useSomeAPI();
  const notify = function (value, ignored = onData(value)) {
    var onData = persist;
  };
  useEffect(() => {
    notify(data); // expect: noPassDataToParent
  }, [data, notify]);
}

export function BodyReferenceWithParameterInitializer({ onData }) {
  const data = useSomeAPI();
  const notify = (value, ignored = true) => {
    var onData = persist;
    onData(value);
  };
  useEffect(() => {
    notify(data);
  }, [data, notify]);
}

export function ShadowedParameterInitializer({ onData }) {
  const data = useSomeAPI();
  const notify = (value, onData = persist, ignored = onData(value)) => {};
  useEffect(() => {
    notify(data);
  }, [data, notify]);
}

declare function register(value: object): boolean;

export function SiblingObjectGetterVar({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    if (register({
      get active() {
        var onData = persist;
        return true;
      },
    })) {
      onData(data); // expect: noPassDataToParent
    }
  }, [data, onData]);
}

export function SiblingObjectSetterVar({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    if (register({
      set active(value) {
        var onData = persist;
      },
    })) {
      onData(data); // expect: noPassDataToParent
    }
  }, [data, onData]);
}

export function ExecutableObjectAccessorBindings({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    register({
      get active() {
        var onData = persist;
        onData(data);
        return true;
      },
      set active(onData) {
        onData(data);
      },
    });
  }, [data, onData]);
}

export function ConstructorOverloadParameter({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    class Box {
      constructor(onData: number);
      constructor(value: number) {
        onData(data); // expect: noPassDataToParent
      }
    }
  }, [data, onData]);
}

export function ConstructorImplementationParameter({ onData }) {
  const data = useSomeAPI();
  useEffect(() => {
    class Box {
      constructor(value: number);
      constructor(onData) {
        onData(data);
      }
    }
  }, [data, onData]);
}
