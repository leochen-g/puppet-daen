"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTextWithRegexList = void 0;
async function parseTextWithRegexList(text, regexList, handler) {
    for (let i = 0; i < regexList.length; ++i) {
        const regex = regexList[i];
        const match = text.match(regex);
        if (!match) {
            continue;
        }
        return await handler(i, match);
    }
    return null;
}
exports.parseTextWithRegexList = parseTextWithRegexList;
//# sourceMappingURL=regex.js.map