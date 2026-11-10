import { useEffect, useRef, useState } from 'react';

export function InitializeAsync() {
  const [data, setData] = useState<unknown>(null);
  useEffect(() => {
    const id = setTimeout(() => setData(1), 100);
    fetch('/x').then((response) => setData(response));
    return () => clearTimeout(id);
  }, []);
  return data;
}

// Layout is measured after commit, so useState can't compute it.
export function Measured() {
  const ref = useRef<HTMLSpanElement>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    setHeight(Number.parseFloat(getComputedStyle(ref.current).lineHeight));
  }, []);
  return <span ref={ref} style={{ minHeight: height }} />;
}

export function ObservedWidth({ element }: { element: HTMLElement }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(element.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return width;
}
