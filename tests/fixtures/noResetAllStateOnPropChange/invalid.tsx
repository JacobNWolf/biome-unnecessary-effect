import { useEffect, useState } from 'react';

export function ProfilePage({ userId }: { userId: string }) {
  const [comment, setComment] = useState('');
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => { // expect: noResetAllStateOnPropChange
    setComment(''); // expect: noAdjustStateOnPropChange
    setDraft(null); // expect: noAdjustStateOnPropChange
  }, [userId]);
  return `${comment}${draft}`;
}

export function Picker({ items }: { items: string[] }) {
  const [picked, setPicked] = useState<string>();
  const [pending, setPending] = useState();
  useEffect(() => { // expect: noResetAllStateOnPropChange
    setPicked(undefined); // expect: noAdjustStateOnPropChange
    setPending(); // expect: noAdjustStateOnPropChange
  }, [items]);
  return picked ?? pending;
}

export function AssertedInitial({ id }) {
 const [user, setUser] = useState(null as string | null);
 useEffect(() => { // expect: noResetAllStateOnPropChange
  setUser(null); // expect: noAdjustStateOnPropChange
 }, [id]);
 return user;
}

export function AssertedReset({ id }) {
  const [count, setCount] = useState(0);
  const [draft, setDraft] = useState('');
  useEffect(() => { // expect: noResetAllStateOnPropChange
    setCount(0 as number); // expect: noAdjustStateOnPropChange
    setDraft('' satisfies string); // expect: noAdjustStateOnPropChange
  }, [id]);
  return [count, draft];
}
