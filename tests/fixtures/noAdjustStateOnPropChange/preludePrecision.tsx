import { useEffect, useState } from 'react';

declare function usePage(): { seo?: { title?: string } } | undefined;

export function MemberNameCollision({ title, currentPage }: { title: string; currentPage: string }) {
  const page = usePage();
  const [metaTitle, setMetaTitle] = useState('');
  useEffect(() => {
    if (currentPage === 'home') {
      setMetaTitle(page?.seo?.title ?? ''); // expect: noAdjustStateOnPropChange
    }
  }, [currentPage, page]);
  return (
    <div>
      <span>{title}</span>
      <input value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} />
    </div>
  );
}

export function useNestedIdenticalCall({ attemptAt }: { attemptAt: string | null }) {
  const [remaining, setRemaining] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  useEffect(() => {
    if (!attemptAt) {
      setIsRateLimited(false); // expect: noAdjustStateOnPropChange
      setRemaining(0); // expect: noAdjustStateOnPropChange
      return;
    }
    const tick = () => {
      setIsRateLimited(false);
    };
    tick();
  }, [attemptAt]);
  return remaining + Number(isRateLimited);
}
