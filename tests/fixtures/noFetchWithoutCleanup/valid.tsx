import { useEffect, useState } from 'react';

export function SearchResults({ query, cache }: { query: string; cache: Map<string, string> }) {
  const [results, setResults] = useState<unknown>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/search?q=${query}`, { signal: controller.signal }).then(setResults);
    return () => controller.abort();
  }, [query]);
  useEffect(() => {
    let ignore = false;
    fetch(`/search?q=${query}`).then((response) => {
      if (!ignore) setResults(response);
    });
    return () => {
      ignore = true;
    };
  }, [query]);
  useEffect(() => {
    document.title = cache.get(query) ?? '';
  }, [cache, query]);
  return results;
}
