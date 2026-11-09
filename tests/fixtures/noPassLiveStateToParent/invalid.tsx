import { useEffect, useState } from 'react';

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
