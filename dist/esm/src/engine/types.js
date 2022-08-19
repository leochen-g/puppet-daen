// 消息类型：1|文本 3|图片 34|语音 42|名片 43|视频 47|动态表情 48|地理位置 49|分享链接或附件 2001|红包 2002|小程序 2003|群邀请 10000|系统消息
export var WechatMessageType;
(function (WechatMessageType) {
    WechatMessageType[WechatMessageType["Text"] = 1] = "Text";
    WechatMessageType[WechatMessageType["Image"] = 3] = "Image";
    WechatMessageType[WechatMessageType["Voice"] = 34] = "Voice";
    WechatMessageType[WechatMessageType["VerifyMsg"] = 37] = "VerifyMsg";
    WechatMessageType[WechatMessageType["PossibleFriendMsg"] = 40] = "PossibleFriendMsg";
    WechatMessageType[WechatMessageType["ShareCard"] = 42] = "ShareCard";
    WechatMessageType[WechatMessageType["Video"] = 43] = "Video";
    WechatMessageType[WechatMessageType["Emoticon"] = 47] = "Emoticon";
    WechatMessageType[WechatMessageType["Location"] = 48] = "Location";
    WechatMessageType[WechatMessageType["App"] = 49] = "App";
    WechatMessageType[WechatMessageType["VoipMsg"] = 50] = "VoipMsg";
    WechatMessageType[WechatMessageType["StatusNotify"] = 51] = "StatusNotify";
    WechatMessageType[WechatMessageType["VoipNotify"] = 52] = "VoipNotify";
    WechatMessageType[WechatMessageType["VoipInvite"] = 53] = "VoipInvite";
    WechatMessageType[WechatMessageType["MicroVideo"] = 62] = "MicroVideo";
    WechatMessageType[WechatMessageType["VerifyMsgEnterprise"] = 65] = "VerifyMsgEnterprise";
    WechatMessageType[WechatMessageType["Transfer"] = 2000] = "Transfer";
    WechatMessageType[WechatMessageType["RedEnvelope"] = 2001] = "RedEnvelope";
    WechatMessageType[WechatMessageType["MiniProgram"] = 2002] = "MiniProgram";
    WechatMessageType[WechatMessageType["GroupInvite"] = 2003] = "GroupInvite";
    WechatMessageType[WechatMessageType["File"] = 2004] = "File";
    WechatMessageType[WechatMessageType["SysNotice"] = 9999] = "SysNotice";
    WechatMessageType[WechatMessageType["Sys"] = 10000] = "Sys";
    WechatMessageType[WechatMessageType["SysTemplate"] = 10002] = "SysTemplate";
})(WechatMessageType || (WechatMessageType = {}));
//# sourceMappingURL=types.js.map