import * as PUPPET from 'wechaty-puppet';
import { executeMessageParsers } from './message/mod.js';
export async function engineMessageToWechaty(puppet, engineMessage) {
    try {
        // set default value for MessagePayloadBase, other fields will be fulfilled or updated var MessageParers
        let ret = {
            id: engineMessage.id,
            talkerId: engineMessage.fromWxid,
            text: engineMessage.msg,
            timestamp: engineMessage.timeStamp,
            type: PUPPET.types.Message.Unknown,
            msgSource: engineMessage.msgSource,
            money: engineMessage.money,
            memo: engineMessage.memo,
            transferid: engineMessage.transferid,
        };
        ret = await executeMessageParsers(puppet, engineMessage, ret);
        // validate the return value
        if (!(ret.roomId || ret.listenerId)) {
            throw new Error('neither roomId nor listenerId');
        }
        return ret;
    }
    catch (e) {
        return {};
    }
}
//# sourceMappingURL=message.js.map