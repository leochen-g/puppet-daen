import type { EmojiMessagePayload } from './messages/message-emotion.js'

// 消息类型：1|文本 3|图片 34|语音 42|名片 43|视频 47|动态表情 48|地理位置 49|分享链接或附件 2001|红包 2002|小程序 2003|群邀请 10000|系统消息
export enum WechatMessageType {
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
  Transfer = 2000, // 转账
  RedEnvelope = 2001, // 红包
  MiniProgram = 2002, // 小程序
  GroupInvite = 2003, // 群邀请
  File = 2004, // 文件消息
  SysNotice = 9999,
  Sys = 10000,
  SysTemplate = 10002, // NOTIFY 服务通知
}

export type FileBoxMetadataMessageType = 'unknown' | 'emoticon';
export type FileBoxMetadataMessagePayload = EmojiMessagePayload;

export interface FileBoxMetadataMessage {
  type: FileBoxMetadataMessageType,
  payload: FileBoxMetadataMessagePayload
}
