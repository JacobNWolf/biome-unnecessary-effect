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

export function NestedIdenticalCall({ attemptAt }: { attemptAt: string | null }) {
  const [isRateLimited, setIsRateLimited] = useState(false);
  useEffect(() => {
    if (!attemptAt) {
      setIsRateLimited(false); // expect: noAdjustStateOnPropChange
      return;
    }
    const tick = () => {
      setIsRateLimited(false);
    };
    tick();
  }, [attemptAt]);
  return isRateLimited;
}
