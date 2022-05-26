/// <reference lib="dom" />
export declare const type = "blob";
declare const fetchable: (url: string, timeout: number) => Promise<Blob>;
export default fetchable;
