# epub-gen-memory --- a library to make EPUBs from HTML

Generate EPUB books from HTML with a simple API in Node.js or the browser.

See [JSZip Support table](https://stuk.github.io/jszip/) for which engines are supported. In addition, browsers need to support `fetch` as well as `DOMParser` and `XMLSerializer` to replace `node-fetch` and `htmlparser2` (plus ecosystem).

------

This EPUB library will generate the needed files, as well as download all referenced images. Note that all fonts and all images respectively are downloaded in parallel in batches, so please keep that in mind when adjusting `fetchTimeout`.

Note that in the browser, only images on servers with CORS enabled can be downloaded.

On the server (with Node.js), image paths can also start with `file://`, in which case they are read directly from disc. The part after `file://` must be a valid path for your system, as read by [`fs.readFile`](https://nodejs.org/api/fs.html#fs_file_url_paths).


## Usage

Install the lib and add it as a dependency (recommended), run in your project directory:

```shell
npm install @mnhlt/epub-gen-memory --save
```

Then put this in your code:

```js
import epub from '@mnhlt/epub-gen-memory';

epub(options).then(
    content => console.log("Ebook Generated Successfully!"),
    err => console.error("Failed to generate Ebook because of ", err)
);
```

See [JSZip documentation](https://github.com/Stuk/jszip/blob/master/documentation/howto/write_zip.md) on how to get the zip to the user. For a nodejs example please see the tests.

In environments where `SharedArrayBuffer` is not available, you might want to instead import from `@mnhlt/epub-gen-memory/sabstub`, which includes a non-functional stub:

```js
import epub from '@mnhlt/epub-gen-memory/sabstub';
```

The package also includes a [browserify](https://www.npmjs.com/package/browserify)d bundle (UMD) as @mnhlt/epub-gen-memory/bundle`. It is possible to use the bundle if you want to build for the browser. The bundle is also available from a CDN: [UNPKG](https://unpkg.com/epub-gen-memory) ([latest](https://unpkg.com/epub-gen-memory), [latest 1.x](https://unpkg.com/epub-gen-memory@^1.0.0)). The bundle also includes the proper return type for the browser (`Promise<Blob>` instead of `Promise<Buffer>`).

```js
import epub from '@mnhlt/epub-gen-memory/bundle';
```

**Note**: This library was written in TypeScript and thus uses ESM exports, but it was compiled to CommonJS, so you can also use the following:

```js
const epub = require('@mnhlt/epub-gen-memory').default;
```

### Write epub with file streaming mode.
**Note**: This mode is only available in Node.js.

In case you want to write the large epub to a file, you can use the streaming mode to avoid memory issues.

```js
import epub from '@mnhlt/epub-gen-memory';

epub(options, content, { stream: true }).then(
    content => console.log("Ebook Generated Successfully!"),
    err => console.error("Failed to generate Ebook because of ", err)
);

or 
import {EpubStream} from '@mnhlt/epub-gen-memory';

const epubStream = new EpubStream(options, content);
await epubStream.genEpub();
```


## API

```ts
import epub, { EPub, optionsDefaults, chapterDefaults } from '@mnhlt/epub-gen-memory';
import type { Options, Content, Chapter, Font } from '@mnhlt/epub-gen-memory';
```


### `epub(optionsOrTitle, content, [version | verbose][])`

- `optionsOrTitle`: `Options | string` if string, then equivalent to `{ title: <optionsOrTitle> }` (see [below](#options))
- `content`: `Chapter[]` (see [below](#chapters))
- varargs: `version`: `3 | 2`, `verbose`: `boolean` (in any order or not at all)
- Returns: `Promise<Buffer>`
- **Browser** Returns: `Promise<Blob>`


### `class EPub`

- `contructor(options: Options, content: Chapter[])`
- `render(): Promise<EPub>`
- `genEpub(): Promise<Buffer>` (Browser `Promise<Blob>`)
- `generateAsync(options: JSZipGeneratorOptions): Promise<...>` see [JSZip.generateAsync](https://stuk.github.io/jszip/documentation/api_jszip/generate_async.html)

protected:
- `generateTemplateFiles(): Promise<void>`
- `downloadAllFonts(): Promise<void>`
- `downloadAllImages(): Promise<void>`
- `makeCover(): Promise<void>`


### `optionsDefaults([version])`

- `version`: `number` (default `3`) Epub version
- Returns: `Options` defaults


### `chapterDefaults(index)`

- `index`: `number` of the chapter
- Returns: `Chapter` defaults

&nbsp;

### Options

- `title`: `string`  
    Title of the book
- `author`: `string | string[]` (optional, default `['anonymous']`)  
    Name of the author for the book, e.g. `"Alice"` or `["Alice", "Bob"]`
- `publisher`: `string` (optional, default `anonymous`)  
    Publisher name
- `description`: `string` (optional)  
    Book description
- `cover`: `string | File` (optional)  
    Book cover image URL, e.g. `"http://abc.com/book-cover.jpg"` or `File` object containing image bytes
- `tocTitle`: `string` (optional, default `Table of Contents`)  
    Title of the Table of Contents
- `tocInTOC`: `boolean` (optional, default `true`)  
    Whether to show the TOC entry in the reader's Table of Contents; only for EPUB2
- `numberChaptersInTOC`: `boolean` (optional, default `true`)  
    Automatically number entries in TOC
- `prependChapterTitles`: `boolean` (optional, default `true`)  
    Automatically put the title of the chapter before the content
- `date`: `string` (optional, default today)  
    Publication date
- `lang`: `string` (optional, default `en`)  
    Language code of the book
- `css`: `string` (optional)  
    CSS string, replaces our default styles, e.g: `"body{background: #000}"`
- `fonts`: `Font[]` (optional)  
    Array of fonts to include, see [below](#fonts)
- `version`: `number` (optional, default `3`)  
    Version of the generated EPUB, `3` for the latest version (http://idpf.org/epub/30) or `2` for the previous version (http://idpf.org/epub/201)
- `fetchTimeout`: `number` (optional, default `20000`)  
    Timeout time for requests, in milliseconds; Browsers need to support `AbortController` and signals for this to work
- `retryTimes`: `number` (optional, default `3`)  
    How many times to retry fetching resources
- `batchSize`: `number` (optional, default `100`)  
    The size of the batches to use when downloading files
- `ignoreFailedDownloads`: `boolean` (optional, default `false`)  
    Instead of throwing, emit a warning and write an empty file if a font or image fails to download
- `verbose`: `boolean | ((type, ...args) => void)` (optional, default `false`)  
    Whether to log progress messages; If a function is provided, the first argument will either be `'log'` or `'warn'`
- `tempDir`: `string` (optional, default `uuid()`)  
    Directory to store temporary files in
- `output`: `string` (optional)  
    file path to write the epub to


### Chapters

**Within each chapter object:**

- `title`: `string` (optional, default `Chapter [number]`)  
    Chapter title
- `author`: `string | string[]` (optional)  
    Chapter author, generates info below chapter title
- `content`: `string`  
    HTML String of the chapter content, image sources are downloaded
- `excludeFromToc`: `boolean` (optional, default `false`)  
    Don't list chapter in Table of Contents
- `beforeToc`: `boolean` (optional, default `false`)  
    List chapter before Table of Contents heading
- `filename`: `string` (optional)  
    Custom name for chapter file
- `url`: `string` (optional)  
    External link below chapter title


### Fonts

**Within each font object:**

- `filename`: `string`  
    Name under which the font should be downloaded, including file extension
- `url`: `string`  
    URL where to find font, for best compatibility use `ttf` (TrueType) fonts


You can then use the fonts as such (assuming you have a font with filename `Merriweather.ttf`):

```css
@font-face {
    font-family: "Merriweather";
    font-style: normal;
    font-weight: normal;
    src : url(./fonts/Merriweather.ttf);
}
```

## Changelog

_Only includes major changes_

### 1.1.2

- **Fixed file names**  
  Internal chapter files are no longer given invalid names if the chapter title includes non-alphanumeric characters

### 1.1.0

- **Optionally disable input validation**  
  In the browser, by default, validation is not bundled due to size. To force use/not use, see the files `lib/util/predicates{-nop}.ts`.
- **Support `File` for cover**  
  Useful in the browser to allow user-uploaded files without temporary storage


## Demo Preview:

![Demo Preview](demo_preview.png?raw=true)

_From Lewis Carroll "Alice's Adventures in Wonderland", based on text at https://www.cs.cmu.edu/~rgs/alice-table.html and images from http://www.alice-in-wonderland.net/resources/pictures/alices-adventures-in-wonderland._

Please see the tests for the code used. EPUBs are generated next to the built test files.


## Credits

This library is based on the work of [@cyrilis](https://github.com/cyrilis).
