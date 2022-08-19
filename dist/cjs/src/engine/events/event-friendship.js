"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const PUPPET = __importStar(require("wechaty-puppet"));
const FRIENDSHIP_CONFIRM_REGEX_LIST = [
    /^You have added (.+) as your WeChat contact. Start chatting!$/,
    /^你已添加了(.+)，现在可以开始聊天了。$/,
    /I've accepted your friend request. Now let's chat!$/,
    /^(.+) just added you to his\/her contacts list. Send a message to him\/her now!$/,
    /^(.+)刚刚把你添加到通讯录，现在可以开始聊天了。$/,
    /^我通过了你的朋友验证请求，现在我们可以开始聊天了$/,
];
const FRIENDSHIP_VERIFY_REGEX_LIST = [
    /^(.+) has enabled Friend Confirmation/,
    /^(.+)开启了朋友验证，你还不是他（她）朋友。请先发送朋友验证请求，对方验证通过后，才能聊天。/,
];
// 已经添加好友
const isConfirm = (message) => {
    return FRIENDSHIP_CONFIRM_REGEX_LIST.some((regexp) => {
        return !!message.msg.match(regexp);
    });
};
// 需要添加好友
const isNeedVerify = (message) => {
    return FRIENDSHIP_VERIFY_REGEX_LIST.some((regexp) => {
        return !!message.msg.match(regexp);
    });
};
exports.default = async (_puppet, message) => {
    if (isConfirm(message)) {
        return {
            contactId: message.fromWxid,
            id: message.id,
            timestamp: message.timeStamp,
            type: PUPPET.types.Friendship.Confirm,
        };
    }
    else if (isNeedVerify(message)) {
        return {
            contactId: message.fromWxid,
            id: message.id,
            timestamp: message.timeStamp,
            type: PUPPET.types.Friendship.Verify,
        };
    }
    else {
        return null;
    }
};
//# sourceMappingURL=event-friendship.js.map