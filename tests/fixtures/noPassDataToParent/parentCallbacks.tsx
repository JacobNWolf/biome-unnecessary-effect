import { memo, useEffect, useState } from 'react';

declare function useSomeAPI(): unknown;
declare function consumeLocally(value: unknown): void;

export function LocalProps() {
  const props = { onData: consumeLocally };
  const data = useSomeAPI();
  const [state] = useState(0);
  useEffect(() => {
    props.onData(data);
    props.onData!(data);
    (props as any).onData(data);
    props.onData(state);
    props.onData!(state);
    (props as any).onData(state);
  }, [props, data, state]);
}

export const MemoizedArrowProps = memo((props: { onData: (value: unknown) => void }) => {
  const data = useSomeAPI();
  const [state] = useState(0);
  useEffect(() => {
    props.onData(data); // expect: noPassDataToParent
    props.onData!(state); // expect: noPassLiveStateToParent
  }, [props, data, state]);
});

export const MemoizedFunctionProps = memo(function (props: { onData: (value: unknown) => void }) {
  const data = useSomeAPI();
  const [state] = useState(0);
  useEffect(() => {
    props.onData!(data); // expect: noPassDataToParent
    props.onData(state); // expect: noPassLiveStateToParent
  }, [props, data, state]);
});

export const FunctionProps = function (props: { onData: (value: unknown) => void }) {
  const data = useSomeAPI();
  const [state] = useState(0);
  useEffect(() => {
    props.onData(data); // expect: noPassDataToParent
    props.onData(state); // expect: noPassLiveStateToParent
  }, [props, data, state]);
};
