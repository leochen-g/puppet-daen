"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomParser = void 0;
const is_type_js_1 = require("../../utils/is-type.js");
async function roomMessageSentByOthers(engineMessage, ret) {
    if ((0, is_type_js_1.isRoomId)(engineMessage.fromWxid) || (0, is_type_js_1.isIMRoomId)(engineMessage.fromWxid)) {
        ret.roomId = engineMessage.fromWxid;
        ret.talkerId = engineMessage.finalFromWxid || engineMessage.fromWxid;
        ret.text = engineMessage.msg;
        /**
         * separator of talkerId and content:
         *
         * text:    "wxid_xxxx:\nnihao"
         * appmsg:  "wxid_xxxx:\n<?xml version="1.0"?><msg><appmsg appid="" sdkver="0">..."
         * pat:     "19850419xxx@chatroom:\n<sysmsg type="pat"><pat><fromusername>xxx</fromusername><chatusername>19850419xxx@chatroom</chatusername><pattedusername>wxid_xxx</pattedusername>...<template><![CDATA["${vagase}" 拍了拍我]]></template></pat></sysmsg>"
         */
    }
}
async function roomMessageSentBySelf(engineMessage, ret) {
    if ((0, is_type_js_1.isRoomId)(engineMessage.fromWxid) || (0, is_type_js_1.isIMRoomId)(engineMessage.fromWxid)) {
        // room message sent by self
        ret.roomId = engineMessage.fromWxid;
        ret.talkerId = engineMessage.finalFromWxid || engineMessage.fromWxid;
        ret.text = engineMessage.msg;
    }
}
/**
 * try to parse talkerId and content for generic room messages
 * @param engineMessage
 * @param ret
 * @param context
 */
const roomParser = async (engineMessage, ret, context) => {
    await roomMessageSentByOthers(engineMessage, ret);
    await roomMessageSentBySelf(engineMessage, ret);
    if (ret.roomId) {
        context.isRoomMessage = true;
        let mentionIdList;
        /**
         *
         */
        if (typeof engineMessage.atWxidList === 'object') {
            engineMessage.atWxidList = [];
        }
        if ((engineMessage.atWxidList && engineMessage.atWxidList.length === 1 && engineMessage.atWxidList[0] === 'announcement@all') || engineMessage.msg.includes('@所有人 ')) {
            const roomPayload = await context.puppet.roomPayload(ret.roomId);
            mentionIdList = roomPayload.memberIdList;
        }
        else {
            mentionIdList = engineMessage.atWxidList || [];
        }
        const room = ret;
        room.mentionIdList = mentionIdList;
    }
    return ret;
};
exports.roomParser = roomParser;
//# sourceMappingURL=message-parser-room.js.map