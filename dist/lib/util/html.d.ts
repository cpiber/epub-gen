import type { EPub } from '..';
export declare type CB = typeof imgSrc;
export declare type Image = {
    url: string;
    id: string;
    extension: string | null;
    mediaType: string | null;
};
declare function imgSrc(this: EPub, url: string): string;
export declare function normalizeHTML(this: EPub, index: number, data: string): string;
export {};
