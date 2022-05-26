"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndNormalizeChapter = exports.validateAndNormalizeChapters = exports.validateAndNormalizeOptions = exports.normName = exports.chapterDefaults = exports.optionsDefaults = exports.chapterPredicate = exports.optionsPredicate = void 0;
var diacritics_1 = require("diacritics");
var mime_1 = require("mime");
var ow_1 = __importDefault(require("ow"));
var chapter_xhtml_ejs_1 = __importDefault(require("../templates/epub2/chapter.xhtml.ejs"));
var content_opf_ejs_1 = __importDefault(require("../templates/epub2/content.opf.ejs"));
var toc_xhtml_ejs_1 = __importDefault(require("../templates/epub2/toc.xhtml.ejs"));
var chapter_xhtml_ejs_2 = __importDefault(require("../templates/epub3/chapter.xhtml.ejs"));
var content_opf_ejs_2 = __importDefault(require("../templates/epub3/content.opf.ejs"));
var toc_xhtml_ejs_2 = __importDefault(require("../templates/epub3/toc.xhtml.ejs"));
var template_css_1 = __importDefault(require("../templates/template.css"));
var toc_ncx_ejs_1 = __importDefault(require("../templates/toc.ncx.ejs"));
var uslug_1 = __importDefault(require("uslug"));
var html_1 = require("./html");
var validate_1 = require("./validate");
Object.defineProperty(exports, "chapterPredicate", { enumerable: true, get: function () { return validate_1.chapterPredicate; } });
Object.defineProperty(exports, "optionsPredicate", { enumerable: true, get: function () { return validate_1.optionsPredicate; } });
__exportStar(require("./html"), exports);
__exportStar(require("./other"), exports);
var optionsDefaults = function (version) {
    if (version === void 0) { version = 3; }
    return ({
        description: '',
        author: ['anonymous'],
        publisher: 'anonymous',
        tocTitle: 'Table of Contents',
        tocInTOC: true,
        numberChaptersInTOC: true,
        prependChapterTitles: true,
        date: new Date().toISOString(),
        lang: "en",
        css: template_css_1.default,
        chapterXHTML: version === 2 ? chapter_xhtml_ejs_1.default : chapter_xhtml_ejs_2.default,
        contentOPF: version === 2 ? content_opf_ejs_1.default : content_opf_ejs_2.default,
        tocNCX: toc_ncx_ejs_1.default,
        tocXHTML: version === 2 ? toc_xhtml_ejs_1.default : toc_xhtml_ejs_2.default,
        fonts: [],
        version: version,
        fetchTimeout: 20000,
        retryTimes: 3,
        batchSize: 100,
        ignoreFailedDownloads: false,
        verbose: false,
    });
};
exports.optionsDefaults = optionsDefaults;
var chapterDefaults = function (index) { return ({
    title: "Chapter " + (index + 1),
    id: "item_" + index,
    url: '',
    excludeFromToc: false,
    beforeToc: false,
}); };
exports.chapterDefaults = chapterDefaults;
var normName = function (name) { return ow_1.default.isValid(name, ow_1.default.string) ? [name] : (name || []); };
exports.normName = normName;
var validateAndNormalizeOptions = function (options) {
    (0, ow_1.default)(options, 'options', validate_1.optionsPredicate);
    // put defaults
    var opt = __assign(__assign({}, (0, exports.optionsDefaults)(options.version || 3)), options);
    opt.author = (0, exports.normName)(opt.author);
    opt.fonts = opt.fonts.map(function (font) { return (__assign(__assign({}, font), { mediaType: (0, mime_1.getType)(font.filename) })); });
    opt.date = new Date(opt.date).toISOString();
    opt.lang = (0, diacritics_1.remove)(opt.lang);
    return opt;
};
exports.validateAndNormalizeOptions = validateAndNormalizeOptions;
function validateAndNormalizeChapters(chapters) {
    var _this = this;
    (0, ow_1.default)(chapters, 'content', ow_1.default.array.ofType(validate_1.chapterPredicate));
    var afterTOC = false;
    return chapters.map(function (chapter, index) {
        var ch = (0, exports.validateAndNormalizeChapter)(chapter, index);
        ch.content = html_1.normalizeHTML.call(_this, index, chapter.content);
        if (afterTOC && ch.beforeToc)
            _this.warn("Warning (content[" + index + "]): Got `beforeToc=true` after at least one `beforeToc=false`. Chapters will be out of order.");
        if (!ch.beforeToc)
            afterTOC = true;
        return ch;
    });
}
exports.validateAndNormalizeChapters = validateAndNormalizeChapters;
var validateAndNormalizeChapter = function (chapter, index) {
    var ch = __assign(__assign({}, (0, exports.chapterDefaults)(index)), chapter);
    var slug = (0, uslug_1.default)((0, diacritics_1.remove)(ch.title));
    if (!ch.filename) {
        ch.filename = index + "_" + slug + ".xhtml";
    }
    else if (!ch.filename.endsWith('.xhtml')) {
        ch.filename = ch.filename + ".xhtml";
    }
    ch.author = (0, exports.normName)(ch.author);
    return ch;
};
exports.validateAndNormalizeChapter = validateAndNormalizeChapter;
