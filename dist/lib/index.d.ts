/// <reference types="node" />
import jszip, { JSZipGeneratorOptions } from 'jszip';
import { Chapter, chapterDefaults, Content, Font, Image, NormChapter, NormOptions, Options, optionsDefaults } from './util';
export { Options, Content, Chapter, Font, optionsDefaults, chapterDefaults };
export declare class EPub {
    protected options: NormOptions;
    protected content: NormChapter[];
    protected uuid: string;
    protected images: Image[];
    protected cover?: {
        extension: string;
        mediaType: string;
    };
    protected log: typeof console.log;
    protected warn: typeof console.warn;
    protected zip: InstanceType<jszip>;
    constructor(options: Options, content: Content);
    render(): Promise<this>;
    genEpub(): Promise<Buffer>;
    generateAsync(options: JSZipGeneratorOptions): Promise<string | Buffer | Uint8Array | number[] | ArrayBuffer | Blob>;
    protected generateTemplateFiles(): Promise<void>;
    protected downloadAllFonts(): Promise<void>;
    protected downloadAllImages(): Promise<void>;
    protected makeCover(): Promise<void>;
}
declare const epub: (optionsOrTitle: Options | string, content: Content, ...args: (boolean | number)[]) => Promise<Buffer>;
export default epub;
