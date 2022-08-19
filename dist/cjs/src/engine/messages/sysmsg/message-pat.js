"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePatMessagePayload = void 0;
async function parsePatMessagePayload(patXml) {
    return {
        chatUserName: patXml.chatusername,
        fromUserName: patXml.fromusername,
        pattedUserName: patXml.pattedusername,
        template: patXml.template,
    };
}
exports.parsePatMessagePayload = parsePatMessagePayload;
//# sourceMappingURL=message-pat.js.map