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
exports.appMsgParser = void 0;
const PUPPET = __importStar(require("wechaty-puppet"));
const wechaty_puppet_1 = require("wechaty-puppet");
const message_parser_js_1 = require("./message-parser.js");
const message_appmsg_js_1 = require("../../messages/message-appmsg.js");
const index_js_1 = require("../../utils/index.js");
const appMsgParser = async (engineMessage, ret, context) => {
    if (ret.type !== PUPPET.types.Message.Attachment) {
        return ret;
    }
    try {
        if (engineMessage.msg.includes('[file=')) {
            const reg = /\[file=(.+)]/;
            const res = engineMessage.msg && reg.exec(engineMessage.msg);
            const path = res?.[1];
            if (path) {
                ret.type = PUPPET.types.Message.Attachment;
                ret.filename = (0, index_js_1.getFileName)(path);
                return ret;
            }
            ret.type = PUPPET.types.Message.Attachment;
            ret.filename = '';
            return ret;
        }
        const appPayload = await (0, message_appmsg_js_1.parseAppmsgMessagePayload)(engineMessage.msg);
        context.appMessagePayload = appPayload;
        switch (appPayload.type) {
            case message_appmsg_js_1.AppMessageType.Text:
                ret.type = PUPPET.types.Message.Text;
                ret.text = appPayload.title;
                break;
            case message_appmsg_js_1.AppMessageType.Audio:
                ret.type = PUPPET.types.Message.Url;
                break;
            case message_appmsg_js_1.AppMessageType.Video:
                ret.type = PUPPET.types.Message.Url;
                break;
            case message_appmsg_js_1.AppMessageType.Url:
                ret.type = PUPPET.types.Message.Url;
                break;
            case message_appmsg_js_1.AppMessageType.Attach:
                ret.type = PUPPET.types.Message.Attachment;
                ret.filename = appPayload.title;
                break;
            case message_appmsg_js_1.AppMessageType.ChatHistory:
                ret.type = PUPPET.types.Message.ChatHistory;
                break;
            case message_appmsg_js_1.AppMessageType.MiniProgram:
            case message_appmsg_js_1.AppMessageType.MiniProgramApp:
                ret.type = PUPPET.types.Message.MiniProgram;
                break;
            case message_appmsg_js_1.AppMessageType.RedEnvelopes:
                ret.type = PUPPET.types.Message.RedEnvelope;
                break;
            case message_appmsg_js_1.AppMessageType.Transfers:
                ret.type = PUPPET.types.Message.Transfer;
                break;
            case message_appmsg_js_1.AppMessageType.RealtimeShareLocation:
                ret.type = PUPPET.types.Message.Location;
                break;
            case message_appmsg_js_1.AppMessageType.GroupNote:
                ret.type = PUPPET.types.Message.GroupNote;
                ret.text = appPayload.title;
                break;
            default:
                ret.type = PUPPET.types.Message.Unknown;
                break;
        }
    }
    catch (e) {
        wechaty_puppet_1.log.warn(message_parser_js_1.LOGPRE, `Error occurred while parse message attachment: ${JSON.stringify(engineMessage)} , ${e.stack}`);
    }
    return ret;
};
exports.appMsgParser = appMsgParser;
//# sourceMappingURL=message-parser-appmsg.js.map