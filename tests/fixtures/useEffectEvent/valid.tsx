import { useEffect, useEffectEvent } from 'react';

declare function createConnection(roomId: string): { on: (event: string, cb: () => void) => void; connect: () => void; disconnect: () => void };

export function ChatRoom({ roomId, theme }: { roomId: string; theme: string }) {
  const onConnected = useEffectEvent(() => {
    console.log('Connected!', theme);
  });
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on('connected', () => {
      onConnected();
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
  return null;
}

declare const emitter: { on(event: string, handler: (error: unknown) => void): () => void };

export function Notice({
  onDismiss,
  onError,
  onWheel,
}: {
  onDismiss: () => void;
  onError: (error: unknown) => void;
  onWheel: () => void;
}) {
  const dismiss = useEffectEvent(onDismiss);
  const emitError = useEffectEvent(onError);
  const handleWheel = useEffectEvent(onWheel);

  useEffect(() => {
    const timer = setTimeout(dismiss, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => emitter.on('error', emitError), []);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return null;
}
