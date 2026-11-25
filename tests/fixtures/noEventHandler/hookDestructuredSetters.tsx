import { useEffect } from 'react';

declare function useDisclosureState(initial: boolean): [boolean, (open: boolean) => void];
declare function useWorkflowContext(): {
  setWorkflowEditorState: (state: string) => void;
  setCurrentConditions: (conditions: string[]) => void;
};
declare function useLongPressTrigger(): { handleOpenChange: (open: boolean) => void };
declare function useToast(): { notify: (message: string) => void };
declare function computeNext(streaming: boolean): boolean;
declare function setCookie(name: string, days: number): void;
declare function track(event: string): void;

export function ArrayHookSetter({ streaming }: { streaming: boolean }) {
  const [open, setOpen] = useDisclosureState(false);

  useEffect(() => {
    if (streaming) setOpen(true);
  }, [streaming]);

  return <div hidden={!open} />;
}

export function ObjectContextSetter({ mode, conditions }: { mode: string; conditions: string[] }) {
  const { setWorkflowEditorState } = useWorkflowContext();
  const { setCurrentConditions } = useWorkflowContext();

  useEffect(() => {
    if (mode) {
      setWorkflowEditorState(mode);
      setCurrentConditions(conditions);
    }
  }, [mode, conditions]);

  return null;
}

export function RenamedHookSetter({ pressed }: { pressed: boolean }) {
  const { handleOpenChange: setIsOverlayOpen } = useLongPressTrigger();

  useEffect(() => {
    if (pressed) setIsOverlayOpen(false);
  }, [pressed]);

  return null;
}

export function HookSetterWithComputedArgument({ streaming }: { streaming: boolean }) {
  const [open, setOpen] = useDisclosureState(false);

  useEffect(() => {
    if (streaming) setOpen(computeNext(streaming));
  }, [streaming]);

  return <div hidden={!open} />;
}

export function ModuleSetter({ isReady, days }: { isReady: boolean; days: number }) {
  useEffect(() => {
    if (isReady) setCookie('seen', days); // expect: noEventHandler
  }, [isReady, days]);

  return null;
}

export function PropSetter({ value, setExternal }: { value: string; setExternal: (value: string) => void }) {
  useEffect(() => {
    if (value) setExternal(value); // expect: noEventHandler
  }, [value]);

  return null;
}

export function NonSetterHookMethod({ isReady }: { isReady: boolean }) {
  const { notify } = useToast();

  useEffect(() => {
    if (isReady) notify('hi'); // expect: noEventHandler
  }, [isReady]);

  return null;
}

export function HookSetterAndSideEffect({ streaming }: { streaming: boolean }) {
  const [open, setOpen] = useDisclosureState(false);

  useEffect(() => {
    if (streaming) { // expect: noEventHandler
      setOpen(true);
      track('open');
    }
  }, [streaming]);

  return <div hidden={!open} />;
}
