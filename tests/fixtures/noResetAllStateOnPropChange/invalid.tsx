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
