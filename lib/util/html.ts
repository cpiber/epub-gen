import mime from 'mime/lite';
import type { EPub } from '..';
import { fixHTML } from './html-parse';
import { uuid } from './other';
import { AEpub } from 'lib/AEpub';

export type CB = typeof imgSrc;

export type Image = {
  url: string,
  id: string,
  extension: string | null,
  mediaType: string | null,
};

function imgSrc(this: AEpub, url: string) {
  let image = this.images.find(i => i.url === url);
  if (!image) {
    const mediaType = mime.getType(url.replace(/\?.*/, "")) || '';
    image = {
      url,
      mediaType,
      id: uuid(),
      extension: mime.getExtension(mediaType) || '',
    };
    this.images.push(image);
  }
  return `images/${image.id}.${image.extension}`;
}

export function normalizeHTML(this: AEpub, index: number, data: string) {
  return fixHTML.call(this, index, data, imgSrc).replace(/^<body(?: xmlns="http:\/\/www\.w3\.org\/1999\/xhtml")?>|<\/body>$/g, '');
}