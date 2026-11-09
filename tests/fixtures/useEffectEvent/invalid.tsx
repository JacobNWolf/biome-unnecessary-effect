import { useEffectEvent } from 'react';

declare function useTimer(callback: () => void, delay: number): void;
declare function Child(props: { onEvent: () => void }): null;

// The Effect Event rules report the first misuse of each Effect Event, so each misuse gets its own event here.
export function Timer({ onTick, label }: { onTick: () => void; label: string }) {
  const duringRender = useEffectEvent(() => onTick());
  const inHandler = useEffectEvent(() => onTick());
  const passedToHook = useEffectEvent(() => onTick());
  const passedAsProp = useEffectEvent(() => onTick());

  duringRender(); // expect: noEffectEventOutsideEffect
  useTimer(passedToHook, 1000); // expect: noPassingEffectEvent
  return (
    <>
      <button type="button" onClick={() => inHandler()}> {/* expect: noEffectEventOutsideEffect */}
        {label}
      </button>
      <Child onEvent={passedAsProp} /> {/* expect: noPassingEffectEvent */}
    </>
  );
}
