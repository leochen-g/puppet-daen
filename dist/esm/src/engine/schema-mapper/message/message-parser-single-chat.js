export const singleChatParser = async (engineMessage, ret, context) => {
    if (!context.isRoomMessage) {
        ret.talkerId = engineMessage.fromWxid;
        ret.listenerId = engineMessage.listenerId;
    }
    return ret;
};
//# sourceMappingURL=message-parser-single-chat.js.map