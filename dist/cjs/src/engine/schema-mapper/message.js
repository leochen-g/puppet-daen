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
exports.engineMessageToWechaty = void 0;
const PUPPET = __importStar(require("wechaty-puppet"));
const mod_js_1 = require("./message/mod.js");
async function engineMessageToWechaty(puppet, engineMessage) {
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
        ret = await (0, mod_js_1.executeMessageParsers)(puppet, engineMessage, ret);
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
exports.engineMessageToWechaty = engineMessageToWechaty;
//# sourceMappingURL=message.js.map