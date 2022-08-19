"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SexType = exports.MsgSource = exports.FromType = void 0;
// 来源类型：1|私聊 2|群聊 3|公众号
var FromType;
(function (FromType) {
    FromType[FromType["CONTACT"] = 1] = "CONTACT";
    FromType[FromType["ROOM"] = 2] = "ROOM";
    FromType[FromType["OFFICE"] = 3] = "OFFICE";
})(FromType = exports.FromType || (exports.FromType = {}));
// 消息来源：0|别人发送 1|自己手机发送
// 如果是转账消息：1|收到转账 2|对方接收转账 3|发出转账 4|自己接收转账 5|对方退还 6|自己退还
var MsgSource;
(function (MsgSource) {
    MsgSource[MsgSource["OTHER"] = 0] = "OTHER";
    MsgSource[MsgSource["SELF"] = 1] = "SELF";
    MsgSource[MsgSource["SIDE"] = 2] = "SIDE";
    MsgSource[MsgSource["SEND"] = 3] = "SEND";
    MsgSource[MsgSource["SELF_RECIVE"] = 4] = "SELF_RECIVE";
    MsgSource[MsgSource["SIDE_BACK"] = 5] = "SIDE_BACK";
    MsgSource[MsgSource["SELF_BACK"] = 6] = "SELF_BACK";
})(MsgSource = exports.MsgSource || (exports.MsgSource = {}));
// 性别，1=男，2=女
var SexType;
(function (SexType) {
    SexType[SexType["MEN"] = 2] = "MEN";
    SexType[SexType["FEMALE"] = 2] = "FEMALE";
})(SexType = exports.SexType || (exports.SexType = {}));
// 撤回 来源类型：1|好友 2|群聊
var RevokeFromType;
(function (RevokeFromType) {
    RevokeFromType[RevokeFromType["CONTACT"] = 1] = "CONTACT";
    RevokeFromType[RevokeFromType["ROOM"] = 2] = "ROOM";
})(RevokeFromType || (RevokeFromType = {}));
// 撤回 消息来源：1|别人撤回 2|自己使用手机撤回 3|自己使用电脑撤回
var RevokeMsgSourceType;
(function (RevokeMsgSourceType) {
    RevokeMsgSourceType[RevokeMsgSourceType["OTHER"] = 1] = "OTHER";
    RevokeMsgSourceType[RevokeMsgSourceType["SELF_PHONE"] = 2] = "SELF_PHONE";
    RevokeMsgSourceType[RevokeMsgSourceType["SELF_PC"] = 3] = "SELF_PC";
})(RevokeMsgSourceType || (RevokeMsgSourceType = {}));
//# sourceMappingURL=engine-schema.js.map