/// <reference types="node" />
export declare const type = "nodebuffer";
declare const fetchable: (url: string, timeout: number) => Promise<Buffer>;
export default fetchable;
