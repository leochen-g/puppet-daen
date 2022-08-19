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
exports.typeParser = void 0;
const PUPPET = __importStar(require("wechaty-puppet"));
const types_js_1 = require("../../types.js");
const wechaty_puppet_1 = require("wechaty-puppet");
const message_parser_js_1 = require("./message-parser.js");
const TypeMappings = {
    [types_js_1.WechatMessageType.Text]: PUPPET.types.Message.Text,
    [types_js_1.WechatMessageType.Image]: PUPPET.types.Message.Image,
    [types_js_1.WechatMessageType.Voice]: PUPPET.types.Message.Audio,
    [types_js_1.WechatMessageType.Emoticon]: PUPPET.types.Message.Emoticon,
    [types_js_1.WechatMessageType.App]: PUPPET.types.Message.Attachment,
    [types_js_1.WechatMessageType.File]: PUPPET.types.Message.Attachment,
    [types_js_1.WechatMessageType.Location]: PUPPET.types.Message.Location,
    [types_js_1.WechatMessageType.Video]: PUPPET.types.Message.Video,
    [types_js_1.WechatMessageType.Sys]: PUPPET.types.Message.Unknown,
    [types_js_1.WechatMessageType.ShareCard]: PUPPET.types.Message.Contact,
    [types_js_1.WechatMessageType.VoipMsg]: PUPPET.types.Message.Recalled,
    [types_js_1.WechatMessageType.SysTemplate]: PUPPET.types.Message.Recalled,
    [types_js_1.WechatMessageType.StatusNotify]: PUPPET.types.Message.Unknown,
    [types_js_1.WechatMessageType.SysNotice]: PUPPET.types.Message.Unknown,
    [types_js_1.WechatMessageType.RedEnvelope]: PUPPET.types.Message.RedEnvelope,
    [types_js_1.WechatMessageType.Transfer]: PUPPET.types.Message.Transfer,
};
const typeParser = async (engineMessage, ret, _context) => {
    let type;
    const wechatMessageType = engineMessage.msgType;
    if (!wechatMessageType) {
        type = PUPPET.types.Message.Unknown;
        ret.type = type;
        return ret;
    }
    type = TypeMappings[wechatMessageType];
    if (!type) {
        wechaty_puppet_1.log.verbose(message_parser_js_1.LOGPRE, `unsupported type: ${JSON.stringify(engineMessage)}`);
        type = PUPPET.types.Message.Unknown;
    }
    ret.type = type;
    return ret;
};
exports.typeParser = typeParser;
//# sourceMappingURL=message-parser-type.js.map