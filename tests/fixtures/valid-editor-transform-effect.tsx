import { useEffect } from 'react';

declare const ParagraphNode: unknown;

type Editor = {
  registerNodeTransform: (
    node: unknown,
    callback: (node: { getTextContent: () => string; remove: () => void }) => void,
  ) => () => void;
};

declare function useEditor(): Editor;

export function ValidEditorTransformEffect() {
  const editor = useEditor();

  useEffect(() => {
    return editor.registerNodeTransform(ParagraphNode, (node) => {
      if (node.getTextContent().trim() === '') {
        node.remove();
      }
    });
  }, [editor]);

  return null;
}
