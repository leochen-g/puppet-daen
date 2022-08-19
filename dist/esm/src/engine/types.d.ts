import type { EmojiMessagePayload } from './messages/message-emotion.js';
export declare enum WechatMessageType {
    Text = 1,
    Image = 3,
    Voice = 34,
    VerifyMsg = 37,
    PossibleFriendMsg = 40,
    ShareCard = 42,
    Video = 43,
    Emoticon = 47,
    Location = 48,
    App = 49,
    VoipMsg = 50,
    StatusNotify = 51,
    VoipNotify = 52,
    VoipInvite = 53,
    MicroVideo = 62,
    VerifyMsgEnterprise = 65,
    Transfer = 2000,
    RedEnvelope = 2001,
    MiniProgram = 2002,
    GroupInvite = 2003,
    File = 2004,
    SysNotice = 9999,
    Sys = 10000,
    SysTemplate = 10002
}
export declare type FileBoxMetadataMessageType = 'unknown' | 'emoticon';
export declare type FileBoxMetadataMessagePayload = EmojiMessagePayload;
export interface FileBoxMetadataMessage {
    type: FileBoxMetadataMessageType;
    payload: FileBoxMetadataMessagePayload;
}
//# sourceMappingURL=types.d.ts.map