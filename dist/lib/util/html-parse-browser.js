"use strict";
/// <reference lib="DOM" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixHTML = void 0;
var constants_1 = require("./constants");
var allowedXhtml11Tags = constants_1.allowedXhtml11Tags.map(function (t) { return t.toUpperCase(); });
function fixHTML(index, html, imgCB) {
    var _this = this;
    var document = new DOMParser().parseFromString(html, 'text/html');
    // reverse to make sure we transform innermost first
    Array.from(document.body.querySelectorAll('*')).reverse().forEach(function (element) {
        for (var _i = 0, _a = Array.from(element.attributes); _i < _a.length; _i++) {
            var a = _a[_i];
            if (constants_1.allowedAttributes.indexOf(a.name) === -1) {
                _this.warn("Warning (content[" + index + "]): attribute " + a.name + " isn't allowed.");
                element.removeAttribute(a.name);
            }
        }
        if (_this.options.version === 2 && allowedXhtml11Tags.indexOf(element.tagName) === -1) {
            _this.warn("Warning (content[" + index + "]): tag " + element.tagName + " isn't allowed in EPUB 2/XHTML 1.1 DTD.");
            var div = document.createElement('div');
            for (var _b = 0, _c = Array.from(element.attributes); _b < _c.length; _b++) {
                var a = _c[_b];
                div.setAttribute(a.name, a.value);
            }
            div.innerHTML = element.innerHTML;
            element.replaceWith(div);
        }
    });
    // record images and change where they point
    document.body.querySelectorAll('img').forEach(function (element) {
        element.alt || (element.alt = "image-placeholder");
        if (!element.src)
            element.remove();
        else
            element.src = imgCB.call(_this, element.src);
    });
    return new XMLSerializer().serializeToString(document.body);
}
exports.fixHTML = fixHTML;
