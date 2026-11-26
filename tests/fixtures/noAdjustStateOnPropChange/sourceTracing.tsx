import { useEffect, useState } from 'react';

const emptyErrors = {};
const NONE = new Set<string>();
const selection = null;
let mutableDefault = {};
declare function useWebsiteContext(): { pages: { id: string }[] };
declare function useData(): { data: string[] };
declare function fetchImage(src: string): Promise<string>;

export function OptionalAlias({ currentNodeState }) {
  const params = currentNodeState?.send_community_message_params;
  const [value, setValue] = useState('');
  useEffect(() => {
    setValue(params?.message ?? ''); // expect: noAdjustStateOnPropChange
  }, [params]);
  return <input value={value} onChange={event => setValue(event.target.value)} />;
}

export function ConstantReset({ isOpen, field }) {
  const [errors, setErrors] = useState({});
  const [draft, setDraft] = useState('');
  useEffect(() => {
    if (!isOpen) return;
    const currentField = field;
    setErrors(emptyErrors); // expect: noAdjustStateOnPropChange
  }, [isOpen, field]);
  return <input value={draft} onChange={event => { setDraft(event.target.value); setErrors({}); }} />;
}

export function ConstantSetReset({ isOpen, thread }) {
  const [keys, setKeys] = useState(NONE);
  useEffect(() => {
    if (!isOpen || thread?.x) return;
    setKeys(NONE); // expect: noAdjustStateOnPropChange
  }, [isOpen, thread]);
  return <button onClick={() => setKeys(new Set())}>{keys.size}</button>;
}

export function ShadowedConstant({ enabled }) {
  const { data } = useData();
  const [selected, setSelected] = useState<string>();
  useEffect(() => {
    if (!enabled) return;
    const selection = data.find(item => item.length > 0);
    setSelected(selection);
  }, [enabled, data]);
  return <button onClick={() => setSelected('manual')}>{selected}</button>;
}

export function MutableBinding({ enabled }) {
  const [value, setValue] = useState({});
  useEffect(() => {
    if (!enabled) return;
    setValue(mutableDefault);
  }, [enabled]);
  return <button onClick={() => setValue({})}>{String(value)}</button>;
}

export function ParameterShadow({ enabled, selection }) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    setValue(selection);
  }, [enabled]);
  return <button onClick={() => setValue(null)}>{String(value)}</button>;
}

export function ImageView(props) {
  const { node, editor } = props;
  const { id, src } = node.attrs;
  const [image, setImage] = useState('');
  const [isPending, setIsPending] = useState(false);
  useEffect(() => {
    if (src) {
      setImage(isPending ? editor.storage.map[id] : src); // expect: noAdjustStateOnPropChange
    }
  }, [src, id, editor, isPending]);
  useEffect(() => {
    if (src) {
      fetchImage(src).then(image => {
        setImage(image);
        setIsPending(false);
      });
    }
  }, [src, editor]);
  return <img src={image} onError={() => setImage('')} />;
}

export function PublishPageSelection({ selectsAllPages }) {
  const { pages } = useWebsiteContext();
  const [selected, setSelected] = useState({});
  useEffect(() => {
    if (!selectsAllPages || !pages?.length) return;
    setSelected(Object.fromEntries(pages.map(page => [page.id, true]))); // expect: noAdjustStateOnPropChange
  }, [selectsAllPages, pages]);
  return <button onClick={() => setSelected({})}>{String(selected)}</button>;
}

export function ContextOnlyLiteral() {
  const { pages } = useWebsiteContext();
  const [value, setValue] = useState(false);
  useEffect(() => {
    if (pages.length) setValue(true);
  }, [pages]);
  return <button onClick={() => setValue(false)}>{String(value)}</button>;
}

export function MixedContextGuard({ enabled }) {
  const { pages } = useWebsiteContext();
  const [value, setValue] = useState('');
  useEffect(() => {
    if (pages) {
      setValue('ready'); // expect: noAdjustStateOnPropChange
    }
  }, [enabled, pages]);
  return <input value={value} onChange={event => setValue(event.target.value)} />;
}
