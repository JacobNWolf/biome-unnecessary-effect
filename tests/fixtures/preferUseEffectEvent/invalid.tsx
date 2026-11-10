import { useEffect, useLayoutEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef(callback);
  useLayoutEffect(() => {
    savedCallback.current = callback; // expect: preferUseEffectEvent
  });
  useEffect(() => {
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// Reads in a callback the effect creates can call an Effect Event.
export function useWaveform(canvas: HTMLCanvasElement, progress: number) {
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress; // expect: preferUseEffectEvent
  }, [progress]);
  useEffect(() => {
    const observer = new ResizeObserver(() => draw(progressRef.current));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvas]);
}

declare function draw(progress: number): void;
