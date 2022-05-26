/// <reference types="node" />
export * from './fetchable';
export declare const uuid: () => string;
export declare const retryFetch: (url: string, timeout: number, retry: number, log: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
}) => Promise<Buffer>;
