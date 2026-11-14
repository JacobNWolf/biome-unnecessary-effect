import { useEffect, useState } from 'react';

export function useSelection({ items }: { items: string[] }) {
  const [selection, setSelection] = useState<string | null>(null);
  useEffect(() => {
    setSelection(null); // expect: noAdjustStateOnPropChange
  }, [items]);
  return selection;
}

export function DifferentAssertedReset({ id }) {
 const [user, setUser] = useState(null as string | null);
 useEffect(() => {
  setUser("other"); // expect: noAdjustStateOnPropChange
 }, [id]);
 return user;
}

export function PartialHelperReset({ userId }) {
  const [user, setUser] = useState(null);
  const [draft, setDraft] = useState('');
  const resetUser = () => setUser(null);
  useEffect(() => {
    resetUser();
  }, [userId]);
  return [user, draft, setDraft];
}

export function DifferentAliasReset({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const reset = setUser;
    reset('other');
  }, [userId]);
  return user;
}

export function LetAliasReset({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let reset = setUser;
    reset(null);
  }, [userId]);
  return user;
}

export function AsyncHelperReset({ userId }) {
  const [user, setUser] = useState(null);
  const resetUser = async () => setUser(null);
  useEffect(() => {
    resetUser();
  }, [userId]);
  return user;
}

export function AsyncFunctionReset({ userId }) {
  const [user, setUser] = useState(null);
  async function resetUser() {
    setUser(null);
  }
  useEffect(() => {
    resetUser();
  }, [userId]);
  return user;
}

export function LetHelperReset({ userId }) {
  const [user, setUser] = useState(null);
  let resetUser = () => setUser(null);
  useEffect(() => {
    resetUser();
  }, [userId]);
  return user;
}

export function ChainedHelperReset({ userId }) {
  const [user, setUser] = useState(null);
  const resetUser = () => setUser(null);
  const reset = () => resetUser();
  useEffect(() => {
    reset();
  }, [userId]);
  return user;
}
