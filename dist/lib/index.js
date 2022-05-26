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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EPub = exports.chapterDefaults = exports.optionsDefaults = void 0;
var ejs_1 = require("ejs");
var jszip_1 = __importDefault(require("jszip"));
var mime_1 = require("mime");
var ow_1 = __importDefault(require("ow"));
var util_1 = require("./util");
Object.defineProperty(exports, "chapterDefaults", { enumerable: true, get: function () { return util_1.chapterDefaults; } });
Object.defineProperty(exports, "optionsDefaults", { enumerable: true, get: function () { return util_1.optionsDefaults; } });
var EPub = /** @class */ (function () {
    function EPub(options, content) {
        this.images = [];
        this.options = (0, util_1.validateAndNormalizeOptions)(options);
        switch (this.options.verbose) {
            case true:
                this.log = console.log.bind(console);
                this.warn = console.warn.bind(console);
                break;
            case false:
                this.log = this.warn = function () { };
                break;
            default:
                this.log = this.options.verbose.bind(null, 'log');
                this.warn = this.options.verbose.bind(null, 'warn');
                break;
        }
        this.uuid = (0, util_1.uuid)();
        this.content = util_1.validateAndNormalizeChapters.call(this, content);
        this.zip = new jszip_1.default();
        this.zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
        if (this.options.cover) {
            var mediaType = (0, mime_1.getType)(this.options.cover);
            var extension = (0, mime_1.getExtension)(mediaType || '');
            if (mediaType && extension)
                this.cover = { mediaType: mediaType, extension: extension };
        }
    }
    EPub.prototype.render = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log('Generating Template Files...');
                        return [4 /*yield*/, this.generateTemplateFiles()];
                    case 1:
                        _a.sent();
                        this.log('Downloading fonts...');
                        return [4 /*yield*/, this.downloadAllFonts()];
                    case 2:
                        _a.sent();
                        this.log('Downloading images...');
                        return [4 /*yield*/, this.downloadAllImages()];
                    case 3:
                        _a.sent();
                        this.log('Making cover...');
                        return [4 /*yield*/, this.makeCover()];
                    case 4:
                        _a.sent();
                        this.log('Finishing up...');
                        return [2 /*return*/, this];
                }
            });
        });
    };
    EPub.prototype.genEpub = function () {
        return __awaiter(this, void 0, void 0, function () {
            var content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.render()];
                    case 1:
                        _a.sent();
                        content = this.zip.generateAsync({
                            type: util_1.type,
                            mimeType: 'application/epub+zip',
                            compression: 'DEFLATE',
                            compressionOptions: {
                                level: 9,
                            },
                        });
                        this.log('Done');
                        return [2 /*return*/, content];
                }
            });
        });
    };
    EPub.prototype.generateAsync = function (options) {
        return this.zip.generateAsync(options);
    };
    EPub.prototype.generateTemplateFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oebps, metainf, opt;
            var _this = this;
            return __generator(this, function (_a) {
                oebps = this.zip.folder('OEBPS');
                oebps.file('style.css', this.options.css);
                this.content.forEach(function (chapter) {
                    var rendered = (0, ejs_1.render)(_this.options.chapterXHTML, __assign({ lang: _this.options.lang, prependChapterTitles: _this.options.prependChapterTitles }, chapter));
                    oebps.file(chapter.filename, rendered);
                });
                metainf = this.zip.folder('META-INF');
                metainf.file('container.xml', '<?xml version="1.0" encoding="UTF-8" ?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
                if (this.options.version === 2) {
                    // write meta-inf/com.apple.ibooks.display-options.xml [from pedrosanta:xhtml#6]
                    metainf.file('com.apple.ibooks.display-options.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><display_options><platform name="*"><option name="specified-fonts">true</option></platform></display_options>');
                }
                opt = __assign(__assign({}, this.options), { id: this.uuid, images: this.images, cover: this.cover, content: this.content });
                oebps.file('content.opf', (0, ejs_1.render)(this.options.contentOPF, opt));
                oebps.file('toc.ncx', (0, ejs_1.render)(this.options.tocNCX, opt));
                oebps.file('toc.xhtml', (0, ejs_1.render)(this.options.tocXHTML, opt));
                return [2 /*return*/];
            });
        });
    };
    EPub.prototype.downloadAllFonts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oebps, fonts, i, fontContents;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.options.fonts.length)
                            return [2 /*return*/, this.log('No fonts to download')];
                        oebps = this.zip.folder('OEBPS');
                        fonts = oebps.folder('fonts');
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.options.fonts.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, Promise.all(this.options.fonts.slice(i, i + this.options.batchSize).map(function (font) {
                                var d = (0, util_1.retryFetch)(font.url, _this.options.fetchTimeout, _this.options.retryTimes, _this.log)
                                    .then(function (res) { return (_this.log("Downloaded font " + font.url), __assign(__assign({}, font), { data: res })); });
                                return _this.options.ignoreFailedDownloads
                                    ? d.catch(function (reason) { return (_this.warn("Warning (font " + font.url + "): Download failed", reason), __assign(__assign({}, font), { data: '' })); })
                                    : d;
                            }))];
                    case 2:
                        fontContents = _a.sent();
                        fontContents.forEach(function (font) { return fonts.file(font.filename, font.data); });
                        _a.label = 3;
                    case 3:
                        i += this.options.batchSize;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EPub.prototype.downloadAllImages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oebps, images, i, imageContents;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.images.length)
                            return [2 /*return*/, this.log('No images to download')];
                        oebps = this.zip.folder('OEBPS');
                        images = oebps.folder('images');
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.images.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, Promise.all(this.images.slice(i, i + this.options.batchSize).map(function (image) {
                                var d = (0, util_1.retryFetch)(image.url, _this.options.fetchTimeout, _this.options.retryTimes, _this.log)
                                    .then(function (res) { return (_this.log("Downloaded image " + image.url), __assign(__assign({}, image), { data: res })); });
                                return _this.options.ignoreFailedDownloads
                                    ? d.catch(function (reason) { return (_this.warn("Warning (image " + image.url + "): Download failed", reason), __assign(__assign({}, image), { data: '' })); })
                                    : d;
                            }))];
                    case 2:
                        imageContents = _a.sent();
                        imageContents.forEach(function (image) { return images.file(image.id + "." + image.extension, image.data); });
                        _a.label = 3;
                    case 3:
                        i += this.options.batchSize;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EPub.prototype.makeCover = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oebps, coverContent;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.cover)
                            return [2 /*return*/, this.log('No cover to download')];
                        oebps = this.zip.folder('OEBPS');
                        return [4 /*yield*/, (0, util_1.retryFetch)(this.options.cover, this.options.fetchTimeout, this.options.retryTimes, this.log)
                                .catch(function (reason) { return (_this.warn("Warning (cover " + _this.options.cover + "): Download failed", reason), ''); })];
                    case 1:
                        coverContent = _a.sent();
                        oebps.file("cover." + this.cover.extension, coverContent);
                        return [2 /*return*/];
                }
            });
        });
    };
    return EPub;
}());
exports.EPub = EPub;
var epub = function (optionsOrTitle, content) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    (0, ow_1.default)(optionsOrTitle, ow_1.default.any(util_1.optionsPredicate, ow_1.default.string));
    var options = ow_1.default.isValid(optionsOrTitle, ow_1.default.string) ? { title: optionsOrTitle } : optionsOrTitle;
    (0, ow_1.default)(args, ow_1.default.array.ofType(ow_1.default.any(ow_1.default.boolean, ow_1.default.number)));
    args.forEach(function (arg) {
        if (ow_1.default.isValid(arg, ow_1.default.boolean))
            options.verbose = arg;
        else
            options.version = arg;
    });
    return new EPub(options, content).genEpub();
};
exports.default = epub;
