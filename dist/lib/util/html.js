"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeHTML = void 0;
var mime_1 = require("mime");
var html_parse_1 = require("./html-parse");
var other_1 = require("./other");
function imgSrc(url) {
    var image = this.images.find(function (i) { return i.url === url; });
    if (!image) {
        var mediaType = (0, mime_1.getType)(url.replace(/\?.*/, "")) || '';
        image = {
            url: url,
            mediaType: mediaType,
            id: (0, other_1.uuid)(),
            extension: (0, mime_1.getExtension)(mediaType) || '',
        };
        this.images.push(image);
    }
    return "images/" + image.id + "." + image.extension;
}
function normalizeHTML(index, data) {
    return html_parse_1.fixHTML.call(this, index, data, imgSrc).replace(/^<body(?: xmlns="http:\/\/www\.w3\.org\/1999\/xhtml")?>|<\/body>$/g, '');
}
exports.normalizeHTML = normalizeHTML;
