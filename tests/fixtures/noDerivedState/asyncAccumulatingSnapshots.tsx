import { useEffect, useState } from 'react';

declare function fetchMore(): Promise<{ posts: string[] }>;
declare function log(): void;

export function AccumulatingAcrossEffects({
  initialPosts,
  fetchedData,
}: {
  initialPosts: string[];
  fetchedData?: { posts: string[] };
}) {
  const [posts, setPosts] = useState<string[]>(initialPosts);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    if (fetchedData) {
      setPosts(posts.concat(fetchedData.posts));
    }
  }, [fetchedData]);

  return posts;
}

export function AccumulatingUpdaterAcrossEffects({ initial, next }: { initial: string[]; next: string }) {
  const [items, setItems] = useState<string[]>(initial);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  useEffect(() => {
    setItems((prev) => [...prev, next]);
  }, [next]);

  return items;
}

export function AliasedAsyncAndAccumulating({ initial, next }: { initial: string[]; next: string }) {
  const [posts, setPosts] = useState<string[]>(initial);
  const [items, setItems] = useState<string[]>(initial);

  useEffect(() => {
    setPosts(initial);
  }, [initial]);
  useEffect(() => {
    const updatePosts = setPosts;
    fetchMore().then((res) => updatePosts(res.posts));
  }, []);

  useEffect(() => {
    setItems(initial);
  }, [initial]);
  useEffect(() => {
    const updateItems = setItems;
    updateItems((prev) => [...prev, next]);
  }, [next]);

  return [posts, items];
}

export function AsyncWritesAcrossEffects({ initial }: { initial: string[] }) {
  const [thenPosts, setThenPosts] = useState<string[]>([]);
  const [catchErr, setCatchErr] = useState<string>('');
  const [finallyDone, setFinallyDone] = useState<string>('');
  const [awaitedPosts, setAwaitedPosts] = useState<string[]>([]);
  const [timedPosts, setTimedPosts] = useState<string[]>([]);

  useEffect(() => {
    setThenPosts(initial);
  }, [initial]);
  useEffect(() => {
    fetchMore().then((res) => setThenPosts(res.posts));
  }, []);

  useEffect(() => {
    setCatchErr(initial[0] ?? '');
  }, [initial]);
  useEffect(() => {
    fetchMore().catch(() => setCatchErr('failed'));
  }, []);

  useEffect(() => {
    setFinallyDone(initial[0] ?? '');
  }, [initial]);
  useEffect(() => {
    fetchMore().finally(() => setFinallyDone('done'));
  }, []);

  useEffect(() => {
    setAwaitedPosts(initial);
  }, [initial]);
  useEffect(() => {
    const load = async () => {
      const res = await fetchMore();
      setAwaitedPosts(res.posts);
    };
    load();
  }, []);

  useEffect(() => {
    setTimedPosts(initial);
  }, [initial]);
  useEffect(() => {
    setTimeout(() => setTimedPosts([]), 100);
  }, []);

  return [thenPosts, catchErr, finallyDone, awaitedPosts, timedPosts];
}

export function DefaultOnceGuard({ items }: { items: string[] }) {
  const [selected, setSelected] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!selected) {
      setSelected(items[0]);
    }
  }, [items, selected]);

  return selected;
}

export function GuardedDerivedState({ items, first, last }: { items: string[]; first: string; last: string }) {
  const [count, setCount] = useState(0);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (count !== items.length) setCount(items.length); // expect: noDerivedState, noDerivedStateDeep
  }, [items]);

  useEffect(() => {
    if (fullName !== first + ' ' + last) setFullName(first + ' ' + last); // expect: noDerivedState, noDerivedStateDeep
  }, [first, last]);

  return [count, fullName];
}

export function InitializedBareIfSnapshot({ postId, hashCommentId }: { postId: string; hashCommentId?: string }) {
  const [savedTarget, setSavedTarget] = useState({ postId, commentId: hashCommentId });

  useEffect(() => {
    if (hashCommentId) {
      setSavedTarget({ postId, commentId: hashCommentId });
    }
  }, [hashCommentId, postId]);

  return savedTarget;
}

export function BareIfComputedDerived({ first, last }: { first: string; last: string }) {
  const [fullName, setFullName] = useState(first + ' ' + last);

  useEffect(() => {
    if (first) setFullName(first + ' ' + last); // expect: noDerivedState, noDerivedStateDeep
  }, [first, last]);

  return fullName;
}

export function IfElseLiteralDerived({ status }: { status: string }) {
  const [iconColor, setIconColor] = useState('gray');

  useEffect(() => {
    if (status === 'active') {
      setIconColor('blue'); // expect: noDerivedState, noDerivedStateDeep
    } else {
      setIconColor('gray');
    }
  }, [status]);

  return iconColor;
}

export function NestedIfElseInsideOuterElse({ on, status }: { on: boolean; status: string }) {
  const [color, setColor] = useState('gray');

  useEffect(() => {
    if (!on) {
      log();
    } else {
      if (status === 'a') {
        setColor('blue'); // expect: noDerivedState, noDerivedStateDeep
      } else {
        setColor('gray');
      }
    }
  }, [on, status]);

  return color;
}

export function UnbracedAndElseIfLiteral({ status }: { status: string }) {
  const [shortColor, setShortColor] = useState('gray');
  const [tierColor, setTierColor] = useState('gray');

  useEffect(() => {
    if (status === 'active') setShortColor('blue'); // expect: noDerivedState, noDerivedStateDeep
    else setShortColor('gray');
  }, [status]);

  useEffect(() => {
    if (status === 'a') {
      setTierColor('blue'); // expect: noDerivedState, noDerivedStateDeep
    } else if (status === 'b') {
      setTierColor('green');
    } else {
      setTierColor('gray');
    }
  }, [status]);

  return [shortColor, tierColor];
}

export function EditableIfElseLiteral({ status }: { status: string }) {
  const [iconColor, setIconColor] = useState('gray');

  useEffect(() => {
    if (status === 'active') {
      setIconColor('blue'); // expect: noAdjustStateOnPropChange
    } else {
      setIconColor('gray');
    }
  }, [status]);

  return <button onClick={() => setIconColor('red')}>{iconColor}</button>;
}
