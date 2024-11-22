import { render as renderTemplate } from 'ejs';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { retryFetch, isString, Options, Content, uuid } from './util';
import { AEpub } from './AEpub';

export class EpubStream extends AEpub {
  protected tempDir: string;

  constructor(options: Options, content: Content) {
    super(options, content);
    this.tempDir = options.tempDir ?? uuid();
  }

  protected async createDirectoryStructure() {
    await fsPromises.mkdir(this.tempDir, { recursive: true });
    await fsPromises.mkdir(path.join(this.tempDir, 'OEBPS'), { recursive: true });
    if (this.images.length) {
      await fsPromises.mkdir(path.join(this.tempDir, 'OEBPS/images'), { recursive: true });
    }
    if (this.options.fonts.length) {
      await fsPromises.mkdir(path.join(this.tempDir, 'OEBPS/fonts'), { recursive: true });
    }
    await fsPromises.mkdir(path.join(this.tempDir, 'META-INF'), { recursive: true });
    await fsPromises.writeFile(path.join(this.tempDir, 'mimetype'), 'application/epub+zip');
  }

  protected async generateTemplateFiles() {
    await this.createDirectoryStructure();
    
    const oebpsPath = path.join(this.tempDir, 'OEBPS');
    await fsPromises.writeFile(path.join(oebpsPath, 'style.css'), this.options.css);

    for (const chapter of this.content) {
      const rendered = renderTemplate(this.options.chapterXHTML, {
        lang: this.options.lang,
        prependChapterTitles: this.options.prependChapterTitles,
        ...chapter,
      });
      await fsPromises.writeFile(path.join(oebpsPath, chapter.filename), rendered);
    }

    const metaPath = path.join(this.tempDir, 'META-INF');
    await fsPromises.writeFile(
      path.join(metaPath, 'container.xml'),
      '<?xml version="1.0" encoding="UTF-8" ?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
    );

    if (this.options.version === 2) {
      await fsPromises.writeFile(
        path.join(metaPath, 'com.apple.ibooks.display-options.xml'),
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><display_options><platform name="*"><option name="specified-fonts">true</option></platform></display_options>'
      );
    }

    const opt = this.getTemplateOptions();
    await fsPromises.writeFile(path.join(oebpsPath, 'content.opf'), renderTemplate(this.options.contentOPF, opt));
    await fsPromises.writeFile(path.join(oebpsPath, 'toc.ncx'), renderTemplate(this.options.tocNCX, opt));
    await fsPromises.writeFile(path.join(oebpsPath, 'toc.xhtml'), renderTemplate(this.options.tocXHTML, opt));
  }

  protected async downloadAllFonts() {
    if (!this.options.fonts.length) return this.log('No fonts to download');

    for (let i = 0; i < this.options.fonts.length; i += this.options.batchSize) {
      const fontBatch = this.options.fonts.slice(i, i + this.options.batchSize);
      await Promise.all(
        fontBatch.map(async font => {
          try {
            const data = await retryFetch(font.url, this.options.fetchTimeout, this.options.retryTimes, this.log);
            await fsPromises.writeFile(path.join(this.tempDir, 'OEBPS/fonts', font.filename), data);
            this.log(`Downloaded font ${font.url}`);
          } catch (error) {
            if (!this.options.ignoreFailedDownloads) throw error;
            this.warn(`Warning (font ${font.url}): Download failed`, error);
          }
        })
      );
    }
  }

  protected async downloadAllImages() {
    if (!this.images.length) return this.log('No images to download');

    for (let i = 0; i < this.images.length; i += this.options.batchSize) {
      const imageBatch = this.images.slice(i, i + this.options.batchSize);
      await Promise.all(
        imageBatch.map(async image => {
          try {
            if (image.url.startsWith('file://')) {
              const stream = await retryFetch(image.url, this.options.fetchTimeout, this.options.retryTimes, this.log, true);
              if (!('pipe' in stream)) {
                throw new Error('Expected a readable stream for file:// URL');
              }
              const writeStream = fs.createWriteStream(path.join(this.tempDir, 'OEBPS/images', `${image.id}.${image.extension}`));
              await new Promise((resolve, reject) => {
                stream.pipe(writeStream)
                  .on('finish', resolve)
                  .on('error', reject);
              });
            } else {
              const data = await retryFetch(image.url, this.options.fetchTimeout, this.options.retryTimes, this.log);
              await fsPromises.writeFile(path.join(this.tempDir, 'OEBPS/images', `${image.id}.${image.extension}`), data);
            }
            this.log(`Downloaded image ${image.url}`);
          } catch (error) {
            if (!this.options.ignoreFailedDownloads) throw error;
            this.warn(`Warning (image ${image.url}): Download failed`, error);
          }
        })
      );
    }
  }

  protected async makeCover() {
    if (!this.cover) return this.log('No cover to download');

    try {
      let coverContent: Buffer;
      if (isString(this.options.cover)) {
        coverContent = await retryFetch(this.options.cover, this.options.fetchTimeout, this.options.retryTimes, this.log) as Buffer;
      } else if (typeof this.options.cover.arrayBuffer !== 'undefined') {
        coverContent = Buffer.from(await this.options.cover.arrayBuffer());
      } else {
        const reader = new FileReader();
        const promise = new Promise<ArrayBuffer>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
        });
        reader.readAsArrayBuffer(this.options.cover);
        coverContent = Buffer.from(await promise);
      }
      await fsPromises.writeFile(path.join(this.tempDir, 'OEBPS', `cover.${this.cover.extension}`), coverContent);
    } catch (error) {
      this.warn(`Warning (cover ${this.options.cover}): Download failed`, error);
      if (!this.options.ignoreFailedDownloads) throw error;
    }
  }

  protected async generateFinal() {
    const outputPath = this.options.output ?? path.join(this.tempDir, 'output.epub');
    
    return new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      archive.on('error', (err) => {
        this.warn('Archive error:', err);
        reject(err);
      });

      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          this.warn('Archive warning:', err);
        } else {
          reject(err);
        }
      });

      archive.on('progress', (progress) => {
        this.log(`Archive progress: ${progress.entries.processed}/${progress.entries.total} entries`);
      });

      archive.pipe(output);

      // Add mimetype first without compression
      archive.file(path.join(this.tempDir, 'mimetype'), { name: 'mimetype', store: true } as any);

      // Add the rest of the directory
      archive.directory(this.tempDir, false, (entry) => {
        if (entry.name === 'mimetype') return false;
        return entry;
      });

      archive.finalize().then(() => {
        this.log('Archive has been finalized');
        resolve();
      }).catch(error => {
        this.warn('Error during finalize:', error);
        reject(error);
      });
    });
  }

  protected async cleanup() {
    await fsPromises.rm(this.tempDir, { recursive: true, force: true });
  }
}
