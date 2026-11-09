import { useEffect, useLayoutEffect } from 'react';

useEffect(() => { api.get(); }, []); // expect: noFetchWithoutCleanup
useEffect(() => { api.get('/items'); }, []); // expect: noFetchWithoutCleanup
useEffect(() => { api.post(); }, []); // expect: noFetchWithoutCleanup
useEffect(() => { api.post('/items'); }, []); // expect: noFetchWithoutCleanup
useEffect(() => { api.put(); }, []); // expect: noFetchWithoutCleanup
useEffect(() => { api.put('/items'); }, []); // expect: noFetchWithoutCleanup
useEffect(() => { api.delete(); }, []); // expect: noFetchWithoutCleanup
useEffect(() => { api.delete('/items'); }, []); // expect: noFetchWithoutCleanup
useEffect(() => { api.patch(); }, []); // expect: noFetchWithoutCleanup
useEffect(() => { api.patch('/items'); }, []); // expect: noFetchWithoutCleanup

useLayoutEffect(() => { api.get(); }, []); // expect: noFetchWithoutCleanup
useLayoutEffect(() => { api.get('/items'); }, []); // expect: noFetchWithoutCleanup
useLayoutEffect(() => { api.post(); }, []); // expect: noFetchWithoutCleanup
useLayoutEffect(() => { api.post('/items'); }, []); // expect: noFetchWithoutCleanup
useLayoutEffect(() => { api.put(); }, []); // expect: noFetchWithoutCleanup
useLayoutEffect(() => { api.put('/items'); }, []); // expect: noFetchWithoutCleanup
useLayoutEffect(() => { api.delete(); }, []); // expect: noFetchWithoutCleanup
useLayoutEffect(() => { api.delete('/items'); }, []); // expect: noFetchWithoutCleanup
useLayoutEffect(() => { api.patch(); }, []); // expect: noFetchWithoutCleanup
useLayoutEffect(() => { api.patch('/items'); }, []); // expect: noFetchWithoutCleanup
