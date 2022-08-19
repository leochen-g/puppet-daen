const messageParserList = [];
export function addMessageParser(parser) {
    messageParserList.push(parser);
}
export async function executeMessageParsers(puppet, engineMessage, ret) {
    const context = {
        isRoomMessage: false,
        puppet,
    };
    for (const parser of messageParserList) {
        ret = await parser(engineMessage, ret, context);
    }
    return ret;
}
export const LOGPRE = 'message-parser';
//# sourceMappingURL=message-parser.js.map