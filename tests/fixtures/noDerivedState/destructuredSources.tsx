import { useEffect, useState } from 'react';

declare function useExternalEmbed(id: string): { data?: { preview?: string } };
declare function usePageContext<T = { header: string }>(): { pageData: T };
declare function useForm(options: { defaultValues: { id: string } }): { data: string };
declare const fallback: { preview?: string };

export function DestructuredHookProp({ embedId }: { embedId: string }) {
  const [preview, setPreview] = useState<string | undefined>();
  const { data } = useExternalEmbed(embedId);

  useEffect(() => {
    setPreview(data?.preview); // expect: noDerivedState
  }, [data]);

  return preview;
}

export function DestructuredHookPropAliased({ embedId }: { embedId: string }) {
  const [preview, setPreview] = useState<string | undefined>();
  const { data: embed = fallback } = useExternalEmbed(embedId);

  useEffect(() => {
    setPreview(embed?.preview); // expect: noDerivedState
  }, [embed]);

  return preview;
}

export function DestructuredHookPropDefaultIgnored({ embedId }: { embedId: string }) {
  const [preview, setPreview] = useState<string | undefined>();
  const { data = fallback } = useExternalEmbed(embedId);

  useEffect(() => {
    setPreview(fallback?.preview);
  }, [data]);

  return preview;
}

export function CustomContextHook() {
  const { pageData } = usePageContext();
  const [header, setHeader] = useState(pageData.header);

  useEffect(() => {
    setHeader(pageData.header); // expect: noDerivedState, noDerivedStateDeep
  }, [pageData]);

  return header;
}

export function CustomContextHookGeneric() {
  const { pageData } = usePageContext<{ header: string }>();
  const [header, setHeader] = useState(pageData.header);

  useEffect(() => {
    setHeader(pageData.header); // expect: noDerivedState, noDerivedStateDeep
  }, [pageData]);

  return header;
}

export function CustomContextHookWholeObject() {
  const pageCtx = usePageContext();
  const [header, setHeader] = useState(pageCtx.pageData.header);

  useEffect(() => {
    setHeader(pageCtx.pageData.header); // expect: noDerivedState, noDerivedStateDeep
  }, [pageCtx]);

  return header;
}

export function ObjectLiteralNotDerived({ posts }: { posts: string[] }) {
  const [result, setResult] = useState('');

  useEffect(() => {
    const { second } = { first: posts, second: 'fixed' };
    setResult(second); // expect: noAdjustStateOnPropChange, noDerivedStateDeep
  }, [posts]);

  return result;
}

export function ControllerHookDestructuredNotDerived({ id }: { id: string }) {
  const [value, setValue] = useState('');
  const { data } = useForm({ defaultValues: { id } });

  useEffect(() => {
    setValue(data);
  }, [data]);

  return value;
}
