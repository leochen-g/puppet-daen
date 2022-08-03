export interface DaenContactRawPayload {
  Alias:        string,
  City:         string,
  NickName:     string,
  Province:     string,
  RemarkName:   string,
  Sex:          number,
  Signature:    string,
  StarFriend:   string,
  Uin:          string,
  UserName:     string,
  HeadImgUrl:   string,

  stranger?:    string, // assign by injectio.js
  VerifyFlag:   number,
}

export interface DaenMessageRawPayload {
  "timeStamp": string,
  "fromType": number,
  "msgType": number,
  "msgSource": number,
  "fromWxid": string,
  "finalFromWxid": string,
  "atWxidList": string[],
  "silence": number,
  "membercount": number,
  "signature": string,
  "msg": string
  RecommendInfo?: string
}

export enum DaenMessageType {
  TEXT                = 1,
  IMAGE               = 3,
  VOICE               = 34,
  VERIFYMSG           = 37,
  POSSIBLEFRIEND_MSG  = 40,
  SHARECARD           = 42,
  VIDEO               = 43,
  EMOTICON            = 47,
  LOCATION            = 48,
  APP                 = 49,
  VOIPMSG             = 50,
  STATUSNOTIFY        = 51,
  VOIPNOTIFY          = 52,
  VOIPINVITE          = 53,
  MICROVIDEO          = 62,
  SYSNOTICE           = 9999,
  SYS                 = 10000,
  RECALLED            = 10002,
}

export interface DaenRoomRawPayload {
  UserName:         string,
  EncryChatRoomId:  string,
  NickName:         string,
  OwnerUin:         number,
  ChatRoomOwner:    string,
}

export interface DaenRoomRawMember {
  UserName    : string,
  NickName    : string,
  DisplayName : string,
  HeadImgUrl  : string,
}
