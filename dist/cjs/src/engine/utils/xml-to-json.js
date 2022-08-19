"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonToXml = exports.xmlToJson = void 0;
const xml2js_1 = require("xml2js");
const wechaty_puppet_1 = require("wechaty-puppet");
async function xmlToJson(xml) {
    const firstIndex = xml.indexOf('<');
    if (firstIndex !== 0) {
        xml = xml.substring(firstIndex, xml.length);
    }
    return new Promise((resolve) => {
        (0, xml2js_1.parseString)(xml, { explicitArray: false }, (err, result) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (err && Object.keys(err).length !== 0) {
                wechaty_puppet_1.log.warn(JSON.stringify(err));
            }
            return resolve(result);
        });
    });
}
exports.xmlToJson = xmlToJson;
async function JsonToXml(json) {
    const builder = new xml2js_1.Builder();
    const xml = builder.buildObject(json);
    return xml;
}
exports.JsonToXml = JsonToXml;
//# sourceMappingURL=xml-to-json.js.map