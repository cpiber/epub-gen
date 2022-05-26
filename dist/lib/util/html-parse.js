"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixHTML = void 0;
var css_select_1 = require("css-select");
var dom_serializer_1 = __importDefault(require("dom-serializer"));
var domutils_1 = require("domutils");
var htmlparser2_1 = require("htmlparser2");
var constants_1 = require("./constants");
var allNodes = (0, css_select_1.compile)('*');
var allImages = (0, css_select_1.compile)('img');
function fixHTML(index, html, imgCB) {
    var _this = this;
    var doc = (0, htmlparser2_1.parseDocument)(html);
    var body = (0, css_select_1.selectOne)('body', doc.children);
    var document = body !== null && body !== void 0 ? body : doc;
    // reverse to make sure we transform innermost first
    (0, css_select_1.selectAll)(allNodes, document).reverse().forEach(function (element) {
        for (var _i = 0, _a = Object.keys(element.attribs); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            if (constants_1.allowedAttributes.indexOf(name_1) === -1) {
                _this.warn("Warning (content[" + index + "]): attribute " + name_1 + " isn't allowed.");
                delete element.attribs[name_1];
            }
        }
        if (_this.options.version === 2 && constants_1.allowedXhtml11Tags.indexOf(element.tagName) === -1) {
            _this.warn("Warning (content[" + index + "]): tag " + element.tagName + " isn't allowed in EPUB 2/XHTML 1.1 DTD.");
            element.tagName = 'div'; // yay for object-based trees
        }
    });
    // record images and change where they point
    (0, css_select_1.selectAll)(allImages, document).forEach(function (element) {
        var _a;
        (_a = element.attribs).alt || (_a.alt = "image-placeholder");
        if (!element.attribs.src)
            (0, domutils_1.removeElement)(element);
        else
            element.attribs.src = imgCB.call(_this, element.attribs.src);
    });
    return (0, dom_serializer_1.default)(document, { xmlMode: true });
}
exports.fixHTML = fixHTML;
