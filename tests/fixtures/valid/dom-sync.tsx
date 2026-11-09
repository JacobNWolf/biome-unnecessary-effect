import { useEffect } from 'react';

const registry = new Set<string>();

export function Register({ id, params }: { id: string; params: URLSearchParams }) {
  useEffect(() => {
    registry.add(id);
    document.title = params.get('q') ?? '';
    return () => {
      registry.delete(id);
    };
  }, [id, params]);
  return null;
}
