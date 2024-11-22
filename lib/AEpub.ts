import { render as renderTemplate } from 'ejs';
import mime from 'mime/lite';
import { Chapter, Content, Font, Image, isString, NormChapter, NormOptions, Options, type, uuid, validateAndNormalizeChapters, validateAndNormalizeOptions } from './util';

export abstract class AEpub {
  protected options: NormOptions;
  protected content: NormChapter[];
  protected uuid: string;
  protected images: Image[] = [];
  protected cover?: { extension: string, mediaType: string; };

  protected log: typeof console.log;
  protected warn: typeof console.warn;

  constructor(options: Options, content: Content) {
    this.options = validateAndNormalizeOptions(options);
    switch (this.options.verbose) {
      case true:
        this.log = console.log.bind(console);
        this.warn = console.warn.bind(console);
        break;
      case false:
        this.log = this.warn = () => { };
        break;
      default:
        this.log = this.options.verbose.bind(null, 'log');
        this.warn = this.options.verbose.bind(null, 'warn');
        break;
    }
    this.uuid = uuid();
    this.content = validateAndNormalizeChapters.call(this, content);

    if (this.options.cover) {
      const fname = isString(this.options.cover) ? this.options.cover : this.options.cover.name;
      const mediaType = mime.getType(fname);
      const extension = mime.getExtension(mediaType || '');
      if (mediaType && extension)
        this.cover = { mediaType, extension };
      else this.warn('Could not detect cover image type from file', fname);
    }
  }

  async render() {
    this.log('Generating Template Files...');
    await this.generateTemplateFiles();
    this.log('Downloading fonts...');
    await this.downloadAllFonts();
    this.log('Downloading images...');
    await this.downloadAllImages();
    this.log('Making cover...');
    await this.makeCover();
    this.log('Finishing up...');
    return this;
  }

  async genEpub() {
    try {
      await this.render();
      const content = await this.generateFinal();
      this.log('Done');
      return content;
    } finally {
      await this.cleanup();
    }
  }

  protected abstract generateTemplateFiles(): Promise<void>;
  protected abstract downloadAllFonts(): Promise<void>;
  protected abstract downloadAllImages(): Promise<void>;
  protected abstract makeCover(): Promise<void>;
  protected abstract generateFinal(): Promise<any>;
  protected abstract cleanup(): Promise<void>;

  protected getTemplateOptions() {
    return {
      ...this.options,
      id: this.uuid,
      images: this.images,
      cover: this.cover,
      content: this.content,
    };
  }
} 