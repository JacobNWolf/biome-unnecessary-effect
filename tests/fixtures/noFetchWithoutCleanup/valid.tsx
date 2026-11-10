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

// One request per mount: nothing newer can race it.
export function AdBlockDetect() {
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    fetch('https://ads.example.com', { method: 'HEAD', mode: 'no-cors' }).catch(() => setBlocked(true));
  }, []);
  return blocked;
}

// The response is never read, so a slow one can't overwrite state.
export function PageView({ postId }: { postId: string }) {
  useEffect(() => {
    fetch('/page_view', { method: 'post', body: postId }).catch((error) => console.error(error));
  }, [postId]);
  return null;
}
