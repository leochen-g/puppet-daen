"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGPRE = exports.executeMessageParsers = exports.addMessageParser = void 0;
const messageParserList = [];
function addMessageParser(parser) {
    messageParserList.push(parser);
}
exports.addMessageParser = addMessageParser;
async function executeMessageParsers(puppet, engineMessage, ret) {
    const context = {
        isRoomMessage: false,
        puppet,
    };
    for (const parser of messageParserList) {
        ret = await parser(engineMessage, ret, context);
    }
    return ret;
}
exports.executeMessageParsers = executeMessageParsers;
exports.LOGPRE = 'message-parser';
//# sourceMappingURL=message-parser.js.map