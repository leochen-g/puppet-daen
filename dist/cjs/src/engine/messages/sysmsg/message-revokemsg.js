"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRevokeOperatorIdForRoomMessage = exports.getRevokeOriginalMessage = exports.parseRevokeMsgMessagePayload = void 0;
const regex_js_1 = require("../../utils/regex.js");
const runner_js_1 = require("../../utils/runner.js");
const is_type_js_1 = require("../../utils/is-type.js");
const YOU_REVOKE_REGEX_LIST = [
    /你撤回了一条消息/,
    /You recalled a message/,
];
const OTHER_REVOKE_REGEX_LIST = [
    /"(.+)" 撤回了一条消息/,
    /"(.+)" has recalled a message./,
];
async function parseRevokeMsgMessagePayload(revokeMsgXmlSchema) {
    let nickName;
    const youRevoke = async () => (0, regex_js_1.parseTextWithRegexList)(revokeMsgXmlSchema.replacemsg, YOU_REVOKE_REGEX_LIST, async () => 'You');
    const otherRevoke = async () => (0, regex_js_1.parseTextWithRegexList)(revokeMsgXmlSchema.replacemsg, OTHER_REVOKE_REGEX_LIST, async (_, match) => {
        nickName = match[1];
        return 'Other';
    });
    const type = (await (0, runner_js_1.executeRunners)([youRevoke, otherRevoke]));
    return {
        content: revokeMsgXmlSchema.replacemsg,
        operatorNickName: nickName,
        originalMessageId: revokeMsgXmlSchema.newmsgid,
        session: revokeMsgXmlSchema.session,
        type,
    };
}
exports.parseRevokeMsgMessagePayload = parseRevokeMsgMessagePayload;
async function getRevokeOriginalMessage(puppet, revokemsgPayload) {
    const messageIdList = await puppet.messageSearch({ id: revokemsgPayload.originalMessageId });
    if (messageIdList.length) {
        return puppet.messagePayload(messageIdList[0]);
    }
    return null;
}
exports.getRevokeOriginalMessage = getRevokeOriginalMessage;
async function getRevokeOperatorIdForRoomMessage(puppet, revokemsgPayload) {
    if ((0, is_type_js_1.isRoomId)(revokemsgPayload.session) || (0, is_type_js_1.isIMRoomId)(revokemsgPayload.session)) {
        const contactIdList = await puppet.roomMemberSearch(revokemsgPayload.session, revokemsgPayload.operatorNickName);
        if (contactIdList.length) {
            return contactIdList[0];
        }
    }
    return null;
}
exports.getRevokeOperatorIdForRoomMessage = getRevokeOperatorIdForRoomMessage;
//# sourceMappingURL=message-revokemsg.js.map