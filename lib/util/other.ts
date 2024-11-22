import fetchable from './fetchable';
export * from './fetchable';

export const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  .replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : r & 0x3 | 0x8).toString(16)
  });

export const retryFetch = async (url: string, timeout: number, retry: number, log: typeof console.log, stream?: boolean) => {
  for (let i = 0; i < retry - 1; i++) {
    try {
      return await fetchable(url, timeout, stream);
    } catch {
      log(`Failed to fetch \`${url}\` ${i+1} ${i === 0 ? 'time' : 'times'}. Retrying...`);
    }
  }
  // last try, no catching
  return fetchable(url, timeout, stream);
}