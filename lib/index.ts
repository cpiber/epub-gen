import { render as renderTemplate } from 'ejs';
import jszip, { generateAsync, JSZipGeneratorOptions } from 'jszip';
import { Chapter, chapterDefaults, Content, Font, Image, isString, NormChapter, NormOptions, Options, optionsDefaults, retryFetch, type, uuid, validateAndNormalizeChapters, validateAndNormalizeOptions, validateIsOptionsOrTitle, validateIsVarargArray } from './util';
import { AEpub } from './AEpub';
import { EpubStream } from './EpubStream';
export { Chapter, chapterDefaults, Content, Font, Options, optionsDefaults, EpubStream };

export class EPub extends AEpub {
  protected zip: InstanceType<jszip>;

  constructor(options: Options, content: Content) {
    super(options, content);
    this.zip = new jszip();
    this.zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  }

  generateAsync<T extends NonNullable<JSZipGeneratorOptions['type']> = NonNullable<JSZipGeneratorOptions['type']>>(options: JSZipGeneratorOptions<T>): ReturnType<typeof generateAsync<T>> {
    return this.zip.generateAsync(options);
  }

  protected async generateFinal() {
    return this.generateAsync({
      type,
      mimeType: 'application/epub+zip',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });
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
    await this.render();
    const content = this.generateFinal();
    this.log('Done');
    return content;
  }

  protected async generateTemplateFiles() {
    const oebps = this.zip.folder('OEBPS')!;
    oebps.file('style.css', this.options.css);

    this.content.forEach(chapter => {
      const rendered = renderTemplate(this.options.chapterXHTML, {
        lang: this.options.lang,
        prependChapterTitles: this.options.prependChapterTitles,
        ...chapter,
      });
      oebps.file(chapter.filename, rendered);
    });

    const metainf = this.zip.folder('META-INF')!;
    metainf.file('container.xml', '<?xml version="1.0" encoding="UTF-8" ?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');

    if (this.options.version === 2) {
      // write meta-inf/com.apple.ibooks.display-options.xml [from pedrosanta:xhtml#6]
      metainf.file('com.apple.ibooks.display-options.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><display_options><platform name="*"><option name="specified-fonts">true</option></platform></display_options>');
    }

    const opt = {
      ...this.options,
      id: this.uuid,
      images: this.images,
      cover: this.cover,
      content: this.content,
    };

    oebps.file('content.opf', renderTemplate(this.options.contentOPF, opt));
    oebps.file('toc.ncx', renderTemplate(this.options.tocNCX, opt));
    oebps.file('toc.xhtml', renderTemplate(this.options.tocXHTML, opt));
  }

  protected async downloadAllFonts() {
    if (!this.options.fonts.length) return this.log('No fonts to download');
    const oebps = this.zip.folder('OEBPS')!;
    const fonts = oebps.folder('fonts')!;

    for (let i = 0; i < this.options.fonts.length; i += this.options.batchSize) {
      const fontContents = await Promise.all(
        this.options.fonts.slice(i, i + this.options.batchSize).map(font => {
          const d = retryFetch(font.url, this.options.fetchTimeout, this.options.retryTimes, this.log)
            .then(res => (this.log(`Downloaded font ${font.url}`), { ...font, data: res }));
          return this.options.ignoreFailedDownloads
            ? d.catch(reason => (this.warn(`Warning (font ${font.url}): Download failed`, reason), { ...font, data: '' }))
            : d;
        })
      );
      fontContents.forEach(font => fonts.file(font.filename, font.data));
    }
  }

  protected async downloadAllImages() {
    if (!this.images.length) return this.log('No images to download');
    const oebps = this.zip.folder('OEBPS')!;
    const images = oebps.folder('images')!;

    for (let i = 0; i < this.images.length; i += this.options.batchSize) {
      const imageContents = await Promise.all(
        this.images.slice(i, i + this.options.batchSize).map(image => {
          const d = retryFetch(image.url, this.options.fetchTimeout, this.options.retryTimes, this.log)
            .then(res => (this.log(`Downloaded image ${image.url}`), { ...image, data: res }));
          return this.options.ignoreFailedDownloads
            ? d.catch(reason => (this.warn(`Warning (image ${image.url}): Download failed`, reason), { ...image, data: '' }))
            : d;
        })
      );
      imageContents.forEach(image => images.file(`${image.id}.${image.extension}`, image.data));
    }
  }

  protected async makeCover() {
    if (!this.cover) return this.log('No cover to download');
    const oebps = this.zip.folder('OEBPS')!;

    if (isString(this.options.cover)) {
      const coverContent = await retryFetch(this.options.cover, this.options.fetchTimeout, this.options.retryTimes, this.log)
        .catch(reason => (this.warn(`Warning (cover ${this.options.cover}): Download failed`, reason), ''));
      if (coverContent) {
        oebps.file(`cover.${this.cover.extension}`, coverContent);
      }
    } else if (typeof this.options.cover.arrayBuffer !== 'undefined') { // node path
      oebps.file(`cover.${this.cover.extension}`, this.options.cover.arrayBuffer());
    } else { // browser path
      const reader = new FileReader();
      const promise = new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = reject;
      });
      reader.readAsArrayBuffer(this.options.cover);
      await promise;
      const coverContent = reader.result as ArrayBuffer;
      oebps.file(`cover.${this.cover.extension}`, coverContent);
    }
  }

  protected cleanup(): Promise<void> {
    return Promise.resolve();
  }
}

const epub = (optionsOrTitle: Options | string, content: Content, ...args: (boolean | number | { stream?: boolean })[]) => {
  validateIsOptionsOrTitle(optionsOrTitle);
  const options = isString(optionsOrTitle) ? { title: optionsOrTitle } : optionsOrTitle;
  validateIsVarargArray(args);
  
  let stream = false;
  args.forEach(arg => {
    if (typeof arg === 'boolean') options.verbose = arg;
    else if (typeof arg === 'number') options.version = arg;
    else if (typeof arg === 'object' && arg !== null && 'stream' in arg) stream = (<any>arg).stream ?? false;
  });

  return stream 
    ? new EpubStream(options, content).genEpub()
    : new EPub(options, content).genEpub();
};
export default epub;