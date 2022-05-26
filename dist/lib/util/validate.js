"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsPredicate = exports.fontPredicate = exports.chapterPredicate = void 0;
var ow_1 = __importDefault(require("ow"));
var name = ow_1.default.optional.any(ow_1.default.string, ow_1.default.array.ofType(ow_1.default.string), ow_1.default.undefined);
var filename = ow_1.default.optional.string.is(function (s) { return (s.indexOf('/') === -1 && s.indexOf('\\') === -1) || "Filename must not include slashes, got `" + s + "`"; });
var filenameReq = ow_1.default.string.is(function (s) { return (s.indexOf('/') === -1 && s.indexOf('\\') === -1) || "Filename must not include slashes, got `" + s + "`"; });
exports.chapterPredicate = ow_1.default.object.partialShape({
    title: ow_1.default.optional.string,
    author: name,
    content: ow_1.default.string,
    excludeFromToc: ow_1.default.optional.boolean,
    beforeToc: ow_1.default.optional.boolean,
    filename: filename,
    url: ow_1.default.optional.string,
});
exports.fontPredicate = ow_1.default.object.partialShape({
    filename: filenameReq,
    url: ow_1.default.string,
});
exports.optionsPredicate = ow_1.default.object.partialShape({
    title: ow_1.default.string,
    author: name,
    publisher: ow_1.default.optional.string,
    description: ow_1.default.optional.string,
    cover: ow_1.default.optional.string,
    tocTitle: ow_1.default.optional.string,
    tocInTOC: ow_1.default.optional.boolean,
    numberChaptersInTOC: ow_1.default.optional.boolean,
    prependChapterTitles: ow_1.default.optional.boolean,
    date: ow_1.default.optional.string,
    lang: ow_1.default.optional.string,
    css: ow_1.default.optional.string,
    chapterXHTML: ow_1.default.optional.string,
    contentOPF: ow_1.default.optional.string,
    tocNCX: ow_1.default.optional.string,
    tocXHTML: ow_1.default.optional.string,
    fonts: ow_1.default.optional.any(ow_1.default.array.ofType(exports.fontPredicate), ow_1.default.undefined),
    version: ow_1.default.optional.number.is(function (x) { return x === 3 || x === 2 ||
        "Expected version to be 3 or 2, got `" + x + "`"; }),
    fetchTimeout: ow_1.default.optional.number.positive,
    retryTimes: ow_1.default.optional.number.positive,
    batchSize: ow_1.default.optional.number.positive,
    ignoreFailedDownloads: ow_1.default.optional.boolean,
    verbose: ow_1.default.optional.any(ow_1.default.boolean, ow_1.default.function),
});
