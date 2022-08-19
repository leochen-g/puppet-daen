import { parseSysmsgMessagePayload } from '../../messages/message-sysmsg.js';
/**
 * try to parse talker and listenerId from sysmsg for room messages
 * @param engineMessage
 * @param ret
 * @param context
 */
export const sysmsgParser = async (engineMessage, ret, context) => {
    const sysmsgPayload = await parseSysmsgMessagePayload(engineMessage);
    if (!sysmsgPayload) {
        return ret;
    }
    switch (sysmsgPayload.type) {
        case 'pat': {
            const patMessagePayload = sysmsgPayload.payload;
            if (context.isRoomMessage) {
                ret.talkerId = patMessagePayload.pattedUserName;
                ret.listenerId = patMessagePayload.fromUserName;
            }
            break;
        }
        case 'roomtoolstips': {
            const todoMessagePayload = sysmsgPayload.payload;
            if (context.isRoomMessage) {
                ret.talkerId = todoMessagePayload.operatorUserName;
            }
            break;
        }
        case 'revokemsg': {
            const revokeMsgPayload = sysmsgPayload.payload;
            if (context.isRoomMessage) {
                // Generic room message logic can get the right talkerId for revoke message
            }
            else {
                // Fix talkerId for single chat revoke message that sent by you
                // talkerId and listenerId for revoke message sent by others is right already
                if (revokeMsgPayload.type === 'You') {
                    ret.listenerId = ret.talkerId;
                    ret.talkerId = context.puppet.currentUserId;
                }
            }
            break;
        }
    }
    return ret;
};
//# sourceMappingURL=message-parser-sysmsg.js.map