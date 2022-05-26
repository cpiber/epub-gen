import { ObjectPredicate } from 'ow';
import { Merge } from 'type-fest';
export declare type Chapter = {
    title?: string;
    author?: string | string[];
    content: string;
    excludeFromToc?: boolean;
    beforeToc?: boolean;
    filename?: string;
    url?: string;
};
export declare type Content = readonly Chapter[];
export declare type Font = {
    filename: string;
    url: string;
};
export declare type LogFn = (type: 'log' | 'warn', ...args: any[]) => void;
export declare type Options = {
    title: string;
    author?: string | string[];
    publisher?: string;
    description?: string;
    cover?: string;
    tocTitle?: string;
    tocInTOC?: boolean;
    numberChaptersInTOC?: boolean;
    prependChapterTitles?: boolean;
    date?: string;
    lang?: string;
    css?: string;
    chapterXHTML?: string;
    contentOPF?: string;
    tocNCX?: string;
    tocXHTML?: string;
    fonts?: Font[];
    version?: number;
    fetchTimeout?: number;
    retryTimes?: number;
    batchSize?: number;
    ignoreFailedDownloads?: boolean;
    verbose?: boolean | LogFn;
};
export declare const chapterPredicate: ObjectPredicate<Chapter>;
export declare const fontPredicate: ObjectPredicate<Font>;
export declare const optionsPredicate: ObjectPredicate<Options>;
declare type NonNullableObject<T> = T extends Record<string, unknown> ? Required<{
    [key in keyof T]: NonNullableObject<T[key]>;
}> : T extends Array<infer R> ? Array<NonNullableObject<R>> : NonNullable<T>;
export declare type NormOptions = NonNullableObject<Merge<Options, {
    author: string[];
    fonts: ({
        mediaType: string | null;
    } & Font)[];
}>>;
export declare type NormChapter = NonNullableObject<Merge<Chapter, {
    id: string;
    author: string[];
}>>;
export {};
