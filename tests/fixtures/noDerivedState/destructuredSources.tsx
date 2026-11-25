import { useEffect, useState } from 'react';

declare function useExternalEmbed(id: string): { data?: { preview?: string } };
declare function usePageContext<T = { header: string }>(): { pageData: T };
declare function useModeContext(): string;
declare function useForm(options: { defaultValues: { id: string } }): { data: string; reset: () => void };
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

export function AssertedControllerHookDestructuredNotDerived({ id }: { id: string }) {
  const [canReset, setCanReset] = useState(false);
  const { reset } = useForm({ defaultValues: { id } }) as { reset: () => void };

  useEffect(() => {
    setCanReset(Boolean(reset));
  }, [reset]);

  return canReset;
}

export function StackedAssertionControllerHookNotDerived({ id }: { id: string }) {
  const [canReset, setCanReset] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const { reset } = (useForm({ defaultValues: { id } }) as unknown) as { reset: () => void };
  const { reset: resetNonNull } = useForm({ defaultValues: { id } })!;
  const { reset: resetSatisfies } = useForm({ defaultValues: { id } }) as { reset: () => void } satisfies {
    reset: () => void;
  };

  useEffect(() => {
    setCanReset(Boolean(reset));
    setCanSubmit(Boolean(resetNonNull));
    setCanSave(Boolean(resetSatisfies));
  }, [reset, resetNonNull, resetSatisfies]);

  return canReset && canSubmit && canSave;
}

export function CustomContextDoesNotSuppressChain() {
  const mode = useModeContext();
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    void mode;
    setCount(1); // expect: noChainStateUpdates
  }, [step, mode]);

  return (
    <button type="button" onClick={() => setStep((s) => s + 1)}>
      {count}
    </button>
  );
}
