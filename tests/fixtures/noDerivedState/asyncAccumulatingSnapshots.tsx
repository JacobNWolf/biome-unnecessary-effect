import { useEffect, useState } from 'react';

declare function fetchMore(): Promise<{ posts: string[] }>;

export function AccumulatingAcrossEffects({
  initialPosts,
  fetchedData,
}: {
  initialPosts: string[];
  fetchedData?: { posts: string[] };
}) {
  const [posts, setPosts] = useState<string[]>(initialPosts);

  useEffect(() => {
    if (posts) {
      setPosts(initialPosts);
    }
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

export function PreviousValueSnapshot({ color }: { color: string }) {
  const [mounted, setMounted] = useState(false);
  const [initialColor, setInitialColor] = useState(color);

  useEffect(() => {
    setMounted(true); // expect: noInitializeState
  }, []);

  useEffect(() => {
    if (mounted && initialColor && color !== initialColor) {
      setInitialColor(color);
    }
  }, [mounted, initialColor, color]);

  return initialColor;
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

export function EditableIfElseLiteral({ status }: { status: string }) {
  const [iconColor, setIconColor] = useState('gray');

  useEffect(() => {
    if (status === 'active') {
      setIconColor('blue'); // expect: noAdjustStateOnPropChange
    } else {
      setIconColor('gray'); // expect: noAdjustStateOnPropChange
    }
  }, [status]);

  return <button onClick={() => setIconColor('red')}>{iconColor}</button>;
}
