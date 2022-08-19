export async function parseTextWithRegexList(text, regexList, handler) {
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
//# sourceMappingURL=regex.js.map