"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRoomLeaveDebouncing = exports.removeRoomLeaveDebounce = void 0;
const is_type_js_1 = require("../utils/is-type.js");
const types_js_1 = require("../types.js");
const runner_js_1 = require("../utils/runner.js");
const YOU_REMOVE_OTHER_REGEX_LIST = [
    /^(你)将"(.+)"移出了群聊/,
    /^(You) removed "(.+)" from the group chat/,
];
const OTHER_REMOVE_YOU_REGEX_LIST = [
    /^(你)被"([^"]+?)"移出群聊/,
    /^(You) were removed from the group chat by "([^"]+)"/,
];
const roomLeaveDebounceMap = new Map();
const DEBOUNCE_TIMEOUT = 3600 * 1000; // 1 hour
function roomLeaveDebounceKey(roomId, removeeId) {
    return `${roomId}:${removeeId}`;
}
function roomLeaveAddDebounce(roomId, removeeId) {
    const key = roomLeaveDebounceKey(roomId, removeeId);
    const oldTimeout = roomLeaveDebounceMap.get(key);
    if (oldTimeout) {
        clearTimeout(oldTimeout);
    }
    const timeout = setTimeout(() => {
        roomLeaveDebounceMap.delete(key);
    }, DEBOUNCE_TIMEOUT);
    roomLeaveDebounceMap.set(key, timeout);
}
// to fix: https://github.com/padlocal/wechaty-puppet-padlocal/issues/43
function removeRoomLeaveDebounce(roomId, removeeId) {
    const key = roomLeaveDebounceKey(roomId, removeeId);
    roomLeaveDebounceMap.delete(key);
}
exports.removeRoomLeaveDebounce = removeRoomLeaveDebounce;
function isRoomLeaveDebouncing(roomId, removeeId) {
    const key = roomLeaveDebounceKey(roomId, removeeId);
    return roomLeaveDebounceMap.get(key) !== undefined;
}
exports.isRoomLeaveDebouncing = isRoomLeaveDebouncing;
exports.default = async (puppet, message) => {
    const roomId = message.fromWxid;
    if (!(0, is_type_js_1.isRoomId)(roomId) || message.msgType !== types_js_1.WechatMessageType.Sys) {
        return null;
    }
    // @ts-ignore
    await puppet._updateRoom(roomId);
    /**
     * 1. 我将别人移除
     * /^(你)将"(.+)"移出了群聊/,
     *  我移除别人是 10000: https://gist.github.com/padlocal/5676b96ad0ca918fdd53849417eff422
     */
    const youRemoveOther = async () => {
        let matches = null;
        YOU_REMOVE_OTHER_REGEX_LIST.some((re) => !!(matches = message.msg.match(re)));
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (matches) {
            const removerName = matches[2];
            const removerId = (await puppet.roomMemberSearch(roomId, removerName))[0];
            return {
                removeeIdList: [removerId],
                removerId: puppet.currentUserId,
                roomId,
                timestamp: message.timeStamp,
            };
        }
        return null;
    };
    /**
     * 2. 别人移除我
     * /^(你)被"([^"]+?)"移出群聊/,
     * // 我被别人移除是 10000：https://gist.github.com/padlocal/60be89334d4d743937f07023da20291e
     */
    const otherRemoveYou = async () => {
        let matches = null;
        OTHER_REMOVE_YOU_REGEX_LIST.some((re) => !!(matches = message.msg.match(re)));
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (matches) {
            const removerName = matches[2];
            const removerId = (await puppet.roomMemberSearch(roomId, removerName))[0];
            return {
                removeeIdList: [puppet.currentUserId],
                removerId,
                roomId,
                timestamp: message.timeStamp,
            };
        }
        return null;
    };
    const ret = await (0, runner_js_1.executeRunners)([youRemoveOther, otherRemoveYou]);
    if (ret) {
        ret.removeeIdList.forEach((leaverId) => {
            roomLeaveAddDebounce(roomId, leaverId);
        });
    }
    return ret;
};
//# sourceMappingURL=event-room-leave.js.map