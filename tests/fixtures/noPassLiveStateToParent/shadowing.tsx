import { useContext, useEffect, useState } from 'react';

declare function persist(value: string): void;
declare const handlers: { persist: typeof persist };
declare const senders: (typeof persist)[];
declare const CallbackContext: React.Context<{ onChange: typeof persist }>;

export function LocalAlias(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    const send = persist;
    send(text);
  }, [text, send]);
}

export function OptionalLocalAlias(props) {
  const [text] = useState('');
  const send = props?.onChange;
  useEffect(() => {
    const send = persist;
    send(text);
  }, [text, send]);
}

export function DestructuredAlias(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    const { persist: send } = handlers;
    send(text);
  }, [text, send]);
}

export function DestructuredProp({ onChange }) {
  const [text] = useState('');
  useEffect(() => {
    const onChange = persist;
    onChange(text);
  }, [text, onChange]);
}

export function LocalProps(props) {
  const [text] = useState('');
  useEffect(() => {
    const props = { onChange: persist };
    props.onChange(text);
  }, [text, props]);
}

export function LoopBinding(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    for (const send of senders) send(text);
  }, [text, send]);
}

export function CatchBinding(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    try {
      persist(text);
    } catch (send) {
      send(text);
    }
  }, [text, send]);
}

export function FunctionBinding(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    function send(value) {
      persist(value);
    }
    send(text);
  }, [text, send]);
}

export function HoistedBinding(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    {
      var send = persist;
    }
    send(text);
  }, [text, send]);
}

export function ParameterBinding(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    senders.forEach(send => send(text));
  }, [text, send]);
}

export function OuterAlias(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    send(text); // expect: noPassLiveStateToParent
  }, [text, send]);
}

export function OptionalOuterAlias(props) {
  const [text] = useState('');
  const send = props?.onChange;
  useEffect(() => {
    send(text); // expect: noPassLiveStateToParent
  }, [text, send]);
}

export function SiblingBlock(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    {
      const send = persist;
      send(text);
    }
    send(text); // expect: noPassLiveStateToParent
  }, [text, send]);
}

export function SiblingParameter(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    senders.forEach(send => send(text));
    send(text); // expect: noPassLiveStateToParent
  }, [text, send]);
}

export function DestructuredParameter(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    [handlers].forEach(({ persist: send }) => send(text));
    send(text); // expect: noPassLiveStateToParent
  }, [text, send]);
}

export function TemporalDeadZone(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    send(text);
    const send = persist;
  }, [text, send]);
}

export function ContextAlias() {
  const [text] = useState('');
  const { onChange: send } = useContext(CallbackContext);
  useEffect(() => {
    const send = persist;
    send(text);
  }, [text, send]);
}

export function OuterContextAlias() {
  const [text] = useState('');
  const { onChange: send } = useContext(CallbackContext);
  useEffect(() => {
    send(text); // expect: noPassLiveStateToParent
  }, [text, send]);
}

export function CommentedHoistedBinding(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    {
      var/* local */ send = persist;
    }
    send(text);
  }, [text, send]);
}

export function SwitchDiscriminant(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    switch (send(text)) { // expect: noPassLiveStateToParent
      case 0:
        const send = persist;
        send(text);
        break;
    }
  }, [text, send]);
}

export function SwitchCaseExpression(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    switch (text) {
      case send(text):
        const send = persist;
        break;
    }
  }, [text, send]);
}

export function TypeOnlyParameter(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    type Handler = (send: string) => void;
    type Constructor = new (send: string) => object;
    interface Handlers {
      method(send: string): void;
      (send: string): void;
      new (send: string): object;
      [send: string]: unknown;
    }
    send(text); // expect: noPassLiveStateToParent
  }, [text, send]);
}

export function CommentedVarInSiblingFunction(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    function local() {
      {
        var/* local */ send = persist;
      }
      send(text);
    }
    send(text); // expect: noPassLiveStateToParent
  }, [text, send]);
}

export function SharedCaseScope(props) {
  const [text] = useState('');
  const send = props.onChange;
  useEffect(() => {
    switch (text) {
      case 0:
        send(text);
        break;
      default:
        const send = persist;
    }
  }, [text, send]);
}
