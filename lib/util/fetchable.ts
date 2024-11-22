import AbortController from "abort-controller";
import * as fs from 'fs/promises';
import fetch from 'node-fetch';
import { URL } from 'url';
import { createReadStream } from 'fs';
export const type = 'nodebuffer';

const fetchable = async (url: string, timeout: number, stream?: boolean) => {
  const controller = new AbortController();
  const out = setTimeout(() => controller.abort(), timeout);

  try {
    if (url.startsWith('file://')) {
      const fileUrl = new URL(url);
      if (stream) {
        return createReadStream(fileUrl);
      }
      return fs.readFile(fileUrl, { signal: controller.signal as AbortSignal });
    }

    const res = await fetch(url, { signal: controller.signal as AbortSignal });
    if (!res.ok)
      throw new Error(`Got error ${res.status} (${res.statusText}) while fetching ${url}`);
    return stream ? res.body : res.buffer();
  } finally {
    clearTimeout(out);
  }
};
export default fetchable;