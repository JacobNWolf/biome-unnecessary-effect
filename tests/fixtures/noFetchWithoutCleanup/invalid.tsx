import { useEffect, useState } from 'react';

import axios from 'axios';

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<unknown>(null);
  useEffect(() => {
    fetch(`/search?q=${query}`).then((response) => response.json()).then(setResults); // expect: noFetchWithoutCleanup
  }, [query]);
  useEffect(() => {
    async function load() {
      const response = await axios.get(`/search?q=${query}`); // expect: noFetchWithoutCleanup
      setResults(response.data);
    }
    load();
  }, [query]);
  return results;
}

export function Profile({ id }: { id: string }) {
  const [profile, setProfile] = useState<unknown>(null);
  useEffect(() => {
    const request = fetch(`/users/${id}`); // expect: noFetchWithoutCleanup
    request.then((response) => response.json()).then(setProfile);
  }, [id]);
  return profile;
}
