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
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var promises_1 = require("fs/promises");
var node_fetch_1 = __importDefault(require("node-fetch"));
var lib_1 = __importStar(require("../lib"));
var aliceData_1 = require("./aliceData");
aliceData_1.optionsAlice.css = "".concat((0, lib_1.optionsDefaults)(2).css, "\n/* latin-ext */\n@font-face {\n  font-family: 'Lato';\n  font-style: normal;\n  font-weight: 400;\n  src: url(./fonts/lato-ext.woff2) format('woff2');\n  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;\n}\n/* latin */\n@font-face {\n  font-family: 'Lato';\n  font-style: normal;\n  font-weight: 400;\n  src: url(./fonts/lato.woff2) format('woff2');\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n}\n\n@font-face {\n  font-family: 'Advent Pro';\n  font-style: normal;\n  font-weight: 400;\n  src: url(./fonts/advent.ttf) format('ttf');\n}\n\nbody {\n  font-family: Lato;\n}\n");
aliceData_1.optionsAlice.fonts = [
    { url: 'https://fonts.gstatic.com/s/lato/v20/S6uyw4BMUTPHjxAwXjeu.woff2', filename: 'lato-ext.woff2' },
    { url: 'https://fonts.gstatic.com/s/lato/v20/S6uyw4BMUTPHjx4wXg.woff2', filename: 'lato.woff2' },
    { url: 'http://fonts.gstatic.com/s/adventpro/v4/1NxMBeKVcNNH2H46AUR3wfesZW2xOQ-xsNqO47m55DA.ttf', filename: 'advent.ttf' },
];
aliceData_1.optionsAlice.version = 2;
aliceData_1.contentAlice.push(__assign(__assign({}, aliceData_1.contentAlice[1]), { content: "<main attr=\"bla\"><img somerandomattr>".concat(aliceData_1.contentAlice[1].content.replace('<img', '<IMG'), "</main><div>") }));
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var content, _a, _b, content2;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, (0, lib_1.default)(aliceData_1.optionsAlice, aliceData_1.contentAlice)];
            case 1:
                content = _d.sent();
                return [4 /*yield*/, (0, promises_1.writeFile)("".concat(__filename.slice(0, -3), ".epub"), Buffer.from(content))];
            case 2:
                _d.sent();
                _b = (_a = aliceData_1.contentAlice).push;
                _c = {};
                return [4 /*yield*/, (0, node_fetch_1.default)('http://example.com/').then(function (res) { return res.text(); })];
            case 3:
                _b.apply(_a, [(_c.content = _d.sent(),
                        _c)]);
                return [4 /*yield*/, (0, lib_1.default)(aliceData_1.optionsAlice, aliceData_1.contentAlice)];
            case 4:
                content2 = _d.sent();
                return [4 /*yield*/, (0, promises_1.writeFile)("".concat(__filename.slice(0, -3), "_html.epub"), Buffer.from(content2))];
            case 5:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); })();
