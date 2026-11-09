import { useEffect, useState } from 'react';

declare const socket: { on: (event: string, cb: (message: string) => void) => () => void };

export function Subscribed({ room }: { room: string }) {
  const [message, setMessage] = useState('');
  useEffect(() => socket.on(room, (next) => setMessage(next)), [room]);
  useEffect(() => {
    const id = setInterval(() => setMessage(room), 1000);
    return () => clearInterval(id);
  }, [room]);
  return message;
}
