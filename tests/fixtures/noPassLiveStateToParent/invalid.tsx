import { memo, useCallback, useEffect, useState } from 'react';

export function Child({ onTextChanged }: { onTextChanged: (text: string) => void }) {
  const [text] = useState('');
  useEffect(() => {
    onTextChanged(text); // expect: noPassLiveStateToParent
  }, [onTextChanged, text]);
  return null;
}

export const useText = (props: { onTextChanged: (text: string) => void }) => {
  const [text] = useState('');
  useEffect(() => {
    props.onTextChanged(text); // expect: noPassLiveStateToParent
  }, [props.onTextChanged, text]);
};

export function DestructuredProps(props: { onFetched: (v: string) => void; label: string }) {
  const [data] = useState('');
  const { onFetched, label } = props;
  useEffect(() => {
    onFetched(data); // expect: noPassLiveStateToParent
  }, [data, onFetched]);
  return label;
}

export function AliasedCallback(props: { onFetched: (v: string) => void }) {
  const [data] = useState('');
  const onFetched = props.onFetched;
  useEffect(() => {
    onFetched(data); // expect: noPassLiveStateToParent
  }, [data, onFetched]);
}

export function NestedCallbacks(props: { callbacks: { onFetched: (v: string) => void } }) {
  const [data] = useState('');
  const { onFetched } = props.callbacks;
  useEffect(() => {
    onFetched(data); // expect: noPassLiveStateToParent
  }, [data, onFetched]);
}

export function LocalWrapper({ onFetched }: { onFetched: (v: string) => void }) {
  const [data] = useState('');
  const onFetchedWrapper = (v: string) => onFetched(v);
  useEffect(() => {
    onFetchedWrapper(data); // expect: noPassLiveStateToParent
  }, [data, onFetchedWrapper]);
}

export function MemoizedWrapper({ onFetched }: { onFetched: (v: string) => void }) {
  const [data] = useState('');
  const wrapped = useCallback((v: string) => onFetched(v), [onFetched]);
  useEffect(() => {
    wrapped(data); // expect: noPassLiveStateToParent
  }, [data, wrapped]);
}

export function MemberWrapper(props: { onFetched: (v: string) => void }) {
  const [data] = useState('');
  const wrapped = (v: string) => props.onFetched(v);
  useEffect(() => {
    wrapped(data); // expect: noPassLiveStateToParent
  }, [data, wrapped]);
}

export function useDestructuredProps(props: { onFetched: (v: string) => void }) {
  const [data] = useState('');
  const { onFetched } = props;
  useEffect(() => {
    onFetched(data); // expect: noPassLiveStateToParent
  }, [data, onFetched]);
}

export const Satisfied = (({ onFetched }: { onFetched: (v: string) => void }) => {
  const [data] = useState<string>();
  useEffect(() => {
    onFetched(data); // expect: noPassLiveStateToParent
  }, [data, onFetched]);
}) satisfies React.FC;

export const Memoized = memo(function ({ onFetched }: { onFetched: (v: string) => void }) {
  const [data] = useState<string>();
  useEffect(() => {
    onFetched(data); // expect: noPassLiveStateToParent
  }, [data, onFetched]);
}) as React.FC;

export const Asserted = (({ onFetched }: { onFetched: (v: string) => void }) => {
  const [data] = useState('');
  useEffect(() => {
    onFetched(data); // expect: noPassLiveStateToParent
  }, [data, onFetched]);
}) as React.FC;

export const MemoizedArrow = memo(({ onFetched }: { onFetched: (v: string) => void }) => {
  const [data] = useState('');
  useEffect(() => {
    onFetched(data); // expect: noPassLiveStateToParent
  }, [data, onFetched]);
}) as React.FC;

export const Components = {
  Child: function NamedChild({ onFetched }: { onFetched: (v: string) => void }) {
    const [data] = useState('');
    useEffect(() => {
      onFetched(data); // expect: noPassLiveStateToParent
    }, [data, onFetched]);
  },
};

export const AssertedCallback = ({ onFetched }: { onFetched: (v: string) => void }) => {
  const [data, setData] = useState<string>();
  useEffect(() => {
    onFetched!(data); // expect: noPassLiveStateToParent
  }, [onFetched, data]);
};

export const AssertedProps = (props: { onFetched: (v: string) => void }) => {
  const [data, setData] = useState<string>();
  useEffect(() => {
    (props as any).onFetched(data); // expect: noPassLiveStateToParent
  }, [props, data]);
};

export function ComparedState({ onFetched }) {
  const [data, setData] = useState('');
  useCustomCompareEffect(() => {
    onFetched(data); // expect: noPassLiveStateToParent
  }, [data, onFetched], cmp);
}
