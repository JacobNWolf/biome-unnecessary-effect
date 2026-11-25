import { useEffect, useState } from 'react';

declare function useContact(): { email?: string } | undefined;
declare function useFetcher<T>(options: { key: string }): { state: string; data?: T };
declare function searchUsers(query: string): void;
declare function notify(message: string): void;

export function MemberStateCollision() {
  const contact = useContact();
  const [email, setEmail] = useState('');
  useEffect(() => {
    if (contact?.email) {
      searchUsers(contact.email);
    }
  }, [contact]);
  return <input value={email} onChange={(event) => setEmail(event.target.value)} />;
}

export function ControllerHookAlias() {
  const [fetchKey, setFetchKey] = useState(0);
  const fetcher = useFetcher<{ message: string }>({ key: `event-${fetchKey}` });
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      notify(fetcher.data.message);
      setFetchKey((count) => count + 1);
    }
  }, [fetcher.state, fetcher.data]);
  return fetchKey;
}

export function NestedIdenticalIf({ open }: { open: boolean }) {
  useEffect(() => {
    if (open) { // expect: noEventHandler
      notify('x');
    }
    const later = () => {
      if (open) {
        notify('x');
      }
    };
    later();
  }, [open]);
}
