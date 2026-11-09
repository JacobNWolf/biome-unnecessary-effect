import { useEffect, useRef } from 'react';

export function ValidEffectComponent({ onScroll }: { onScroll?: (scrollY: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLDivElement;
      onScroll?.(target.scrollTop);
    };

    const element = containerRef.current;
    element.addEventListener('scroll', handleScroll);

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [onScroll]);

  return (
    <div ref={containerRef} style={{ height: '200px', overflow: 'auto' }}>
      <div style={{ height: '500px' }}>Scrollable content</div>
    </div>
  );
}
