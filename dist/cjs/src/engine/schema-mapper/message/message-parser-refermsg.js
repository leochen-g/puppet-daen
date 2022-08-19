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
exports.referMsgParser = void 0;
const PUPPET = __importStar(require("wechaty-puppet"));
const message_appmsg_js_1 = require("../../messages/message-appmsg.js");
const types_js_1 = require("../../types.js");
const referMsgParser = async (_padLocalMessage, ret, context) => {
    if (!context.appMessagePayload || context.appMessagePayload.type !== message_appmsg_js_1.AppMessageType.ReferMsg) {
        return ret;
    }
    const appPayload = context.appMessagePayload;
    let referMessageContent;
    const referMessagePayload = appPayload.refermsg;
    const referMessageType = parseInt(referMessagePayload.type);
    switch (referMessageType) {
        case types_js_1.WechatMessageType.Text:
            referMessageContent = referMessagePayload.content;
            break;
        case types_js_1.WechatMessageType.Image:
            referMessageContent = '图片';
            break;
        case types_js_1.WechatMessageType.Video:
            referMessageContent = '视频';
            break;
        case types_js_1.WechatMessageType.Emoticon:
            referMessageContent = '动画表情';
            break;
        case types_js_1.WechatMessageType.Location:
            referMessageContent = '位置';
            break;
        case types_js_1.WechatMessageType.App: {
            const referMessageAppPayload = await (0, message_appmsg_js_1.parseAppmsgMessagePayload)(referMessagePayload.content);
            referMessageContent = referMessageAppPayload.title;
            break;
        }
        default:
            referMessageContent = '未知消息';
            break;
    }
    ret.type = PUPPET.types.Message.Text;
    ret.text = `「${referMessagePayload.displayname}：${referMessageContent}」\n- - - - - - - - - - - - - - -\n${appPayload.title}`;
    return ret;
};
exports.referMsgParser = referMsgParser;
//# sourceMappingURL=message-parser-refermsg.js.map