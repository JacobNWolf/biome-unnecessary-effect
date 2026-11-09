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
