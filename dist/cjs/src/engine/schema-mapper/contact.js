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
exports.engineContactToWechaty = void 0;
const PUPPET = __importStar(require("wechaty-puppet"));
const is_type_js_1 = require("../utils/is-type.js");
function engineContactToWechaty(contact) {
    return {
        alias: contact.remark,
        avatar: contact.avatar,
        city: contact.city,
        gender: contact.sex,
        id: contact.wxid,
        name: contact.name,
        phone: [],
        province: contact.province,
        signature: contact.sign,
        type: (0, is_type_js_1.isContactOfficialId)(contact.wxid) ? PUPPET.types.Contact.Official : PUPPET.types.Contact.Individual,
        weixin: contact.wxNum,
    };
}
exports.engineContactToWechaty = engineContactToWechaty;
//# sourceMappingURL=contact.js.map