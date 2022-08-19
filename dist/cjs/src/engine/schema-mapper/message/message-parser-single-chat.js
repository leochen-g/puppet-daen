"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleChatParser = void 0;
const singleChatParser = async (engineMessage, ret, context) => {
    if (!context.isRoomMessage) {
        ret.talkerId = engineMessage.fromWxid;
        ret.listenerId = engineMessage.listenerId;
    }
    return ret;
};
exports.singleChatParser = singleChatParser;
//# sourceMappingURL=message-parser-single-chat.js.map