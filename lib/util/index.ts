import { remove as removeDiacritics } from 'diacritics';
import mime from 'mime/lite';
import slugify from 'slugify';
import chapterXHTML2 from 'templates/epub2/chapter.xhtml.ejs';
import contentOPF2 from 'templates/epub2/content.opf.ejs';
import tocXHTML2 from 'templates/epub2/toc.xhtml.ejs';
import chapterXHTML3 from 'templates/epub3/chapter.xhtml.ejs';
import contentOPF3 from 'templates/epub3/content.opf.ejs';
import tocXHTML3 from 'templates/epub3/toc.xhtml.ejs';
import css from 'templates/template.css';
import tocNCX from 'templates/toc.ncx.ejs';
import type { EPub } from '..';
import { normalizeHTML } from './html';
import { isString, validateIsChapters, validateIsOptions, validateIsOptionsOrTitle, validateIsVarargArray } from './predicates';
import { Chapter, Content, Font, NormChapter, NormOptions, Options } from './validate';
import { AEpub } from 'lib/AEpub';

export * from './html';
export * from './other';
export { Chapter, Content, Font, isString, NormChapter, NormOptions, Options, validateIsChapters, validateIsOptions, validateIsOptionsOrTitle, validateIsVarargArray };


export const optionsDefaults = (version = 3): Omit<Options, 'title'> => ({
  description: '',
  author: ['anonymous'],
  publisher: 'anonymous',
  tocTitle: 'Table of Contents',
  tocInTOC: true,
  numberChaptersInTOC: true,
  prependChapterTitles: true,
  date: new Date().toISOString(),
  lang: "en",
  css,
  chapterXHTML: version === 2 ? chapterXHTML2 : chapterXHTML3,
  contentOPF: version === 2 ? contentOPF2 : contentOPF3,
  tocNCX,
  tocXHTML: version === 2 ? tocXHTML2 : tocXHTML3,
  fonts: [],
  version,
  fetchTimeout: 20000,
  retryTimes: 3,
  batchSize: 100,
  ignoreFailedDownloads: false,
  verbose: false,
});

export const chapterDefaults = (index: number) => ({
  title: `Chapter ${index + 1}`,
  id: `item_${index}`,
  url: '',
  excludeFromToc: false,
  beforeToc: false,
});


export const normName = (name: string | string[] | undefined): string[] => isString(name) ? [name] : (name || []);

export const validateAndNormalizeOptions = (options: Options) => {
  validateIsOptions(options);

  // put defaults
  const opt = {
    ...optionsDefaults(options.version || 3),
    ...options,
  } as NormOptions;
  opt.author = normName(opt.author);
  opt.fonts = opt.fonts.map(font => ({ ...font, filename: font.filename.replace(/\s/g, '_').replace(/[^-._A-Za-z0-9]/g, ''), mediaType: mime.getType(font.filename)! }));
  opt.date = new Date(opt.date).toISOString();
  opt.lang = removeDiacritics(opt.lang);
  return opt;
};

export function validateAndNormalizeChapters(this: AEpub, chapters: readonly Chapter[]) {
  validateIsChapters(chapters);

  let afterTOC = false;
  return chapters.map((chapter, index) => {
    const ch = validateAndNormalizeChapter(chapter, index);
    ch.content = normalizeHTML.call(this, index, chapter.content);
    if (afterTOC && ch.beforeToc)
      this.warn(`Warning (content[${index}]): Got \`beforeToc=true\` after at least one \`beforeToc=false\`. Chapters will be out of order.`);
    if (!ch.beforeToc) afterTOC = true;
    return ch;
  });
}

export const validateAndNormalizeChapter = (chapter: Chapter, index: number) => {
  const ch = {
    ...chapterDefaults(index),
    ...chapter,
  } as NormChapter;

  const slug = slugify(ch.title, { lower: true, strict: true });
  if (!ch.filename) {
    ch.filename = `${index}_${slug}.xhtml`;
  } else if (!ch.filename.endsWith('.xhtml')) {
    ch.filename = `${ch.filename}.xhtml`;
  }
  ch.filename = ch.filename.replace(/\s/g, '_').replace(/[^-._A-Za-z0-9]/g, '');
  ch.author = normName(ch.author);
  return ch;
};

