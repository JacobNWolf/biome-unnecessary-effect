import { useEffect, useState } from 'react';

export function TriggerPriority({ editor, src }: { editor: { resolve: (src: string) => string }; src: string }) {
  const [image, setImage] = useState('');

  useEffect(() => {
    setImage(editor.resolve(src)); // expect: noAdjustStateOnPropChange
  }, [editor, src]);

  useEffect(() => {
    if (editor && src) {
      setImage(''); // expect: noAdjustStateOnPropChange
    }
  }, [editor, src]);

  useEffect(() => {
    setImage(String(editor)); // expect: noAdjustStateOnPropChange
  }, [editor]);

  useEffect(() => {
    if (editor) {
      setImage(''); // expect: noAdjustStateOnPropChange
    }
  }, [editor]);

  return <input value={image} onChange={(event) => setImage(event.target.value)} />;
}
