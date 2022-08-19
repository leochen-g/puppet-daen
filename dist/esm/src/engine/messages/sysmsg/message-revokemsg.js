import { parseTextWithRegexList } from '../../utils/regex.js';
import { executeRunners } from '../../utils/runner.js';
import { isIMRoomId, isRoomId } from '../../utils/is-type.js';
const YOU_REVOKE_REGEX_LIST = [
    /你撤回了一条消息/,
    /You recalled a message/,
];
const OTHER_REVOKE_REGEX_LIST = [
    /"(.+)" 撤回了一条消息/,
    /"(.+)" has recalled a message./,
];
export async function parseRevokeMsgMessagePayload(revokeMsgXmlSchema) {
    let nickName;
    const youRevoke = async () => parseTextWithRegexList(revokeMsgXmlSchema.replacemsg, YOU_REVOKE_REGEX_LIST, async () => 'You');
    const otherRevoke = async () => parseTextWithRegexList(revokeMsgXmlSchema.replacemsg, OTHER_REVOKE_REGEX_LIST, async (_, match) => {
        nickName = match[1];
        return 'Other';
    });
    const type = (await executeRunners([youRevoke, otherRevoke]));
    return {
        content: revokeMsgXmlSchema.replacemsg,
        operatorNickName: nickName,
        originalMessageId: revokeMsgXmlSchema.newmsgid,
        session: revokeMsgXmlSchema.session,
        type,
    };
}
export async function getRevokeOriginalMessage(puppet, revokemsgPayload) {
    const messageIdList = await puppet.messageSearch({ id: revokemsgPayload.originalMessageId });
    if (messageIdList.length) {
        return puppet.messagePayload(messageIdList[0]);
    }
    return null;
}
export async function getRevokeOperatorIdForRoomMessage(puppet, revokemsgPayload) {
    if (isRoomId(revokemsgPayload.session) || isIMRoomId(revokemsgPayload.session)) {
        const contactIdList = await puppet.roomMemberSearch(revokemsgPayload.session, revokemsgPayload.operatorNickName);
        if (contactIdList.length) {
            return contactIdList[0];
        }
    }
    return null;
}
//# sourceMappingURL=message-revokemsg.js.map