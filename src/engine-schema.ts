/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2022 Leo_chen <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import type * as PUPPET from 'wechaty-puppet'
import type { WechatMessageType } from './engine/types.js'
// 来源类型：1|私聊 2|群聊 3|公众号
enum FromType {
  CONTACT = 1,
  ROOM    = 2,
  OFFICE  = 3,
}

// 消息来源：0|别人发送 1|自己手机发送
// 如果是转账消息：1|收到转账 2|对方接收转账 3|发出转账 4|自己接收转账 5|对方退还 6|自己退还
export enum MsgSource {
  OTHER = 0,
  SELF = 1,
  SIDE = 2,
  SEND = 3,
  SELF_RECIVE= 4,
  SIDE_BACK = 5,
  SELF_BACK = 6
}

export interface MessagePayload {
  id: string,
  timeStamp: number,
  fromType: FromType,
  msgType?: WechatMessageType,
  msgSource: MsgSource,
  fromWxid: string, // fromType=1时为好友wxid，fromType=2时为群wxid，fromType=3时公众号wxid
  finalFromWxid: string, // 仅fromType=2时有效，为群内发言人wxid
  atWxidList?: string[], // 仅fromType=2，且msgSource=0时有效，为消息中艾特人wxid列表
  silence?: number, // 仅fromType=2时有效，0
  membercount?: number, // 仅fromType=2时有效，群成员数量
  signature?: string, // 消息签名
  msg: string, // 消息内容
  msgBase64?: string, // 消息内容的Base64
  listenerId: string, //
  transferid?: string, // 转账id
  memo?: string, // 转账备注
  money?: string, // 转账金额
  transType?: string // 1|即时到账 2|延时到账
}

// 性别，1=男，2=女
export enum SexType {
  MEN = 2,
  FEMALE = 2
}

export interface ContactPayload {
  /**
   * 头像大图，需在会话列表中
   */
  avatarUrl: string;
  /**
   * 头像小图，需在会话列表中
   */
  avatarMinUrl?: string;

  avatarMaxUrl?: string;
  /**
   * 城市，需在会话列表中
   */
  city: string;
  /**
   * 国家，需在会话列表中
   */
  country: string;
  /**
   * 英文简称，查询对象信息时此参数有效，获取XX列表时无效
   */
  enBrief?: string;
  /**
   * 英文全称，查询对象信息时此参数有效，获取XX列表时无效
   */
  enWhole?: string;
  /**
   * 群成员数量，仅当对象是群聊时有效
   */
  memberNum?: number;
  /**
   * 朋友圈背景图，需在会话列表中
   */
  momentsBackgroudImgUrl?: string;
  /**
   * 昵称
   */
  nick: string;
  name: string;
  /**
   * 昵称简拼
   */
  nickBrief?: string;
  /**
   * 昵称全拼
   */
  nickWhole?: string;
  /**
   * 省份，需在会话列表中
   */
  province: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 备注简拼
   */
  remarkBrief?: string;
  /**
   * 备注全拼
   */
  remarkWhole?: string;
  /**
   * 性别，1=男，2=女
   */
  sex: PUPPET.types.ContactGender;
  /**
   * 签名，需在会话列表中
   */
  sign?: string;
  /**
   * V3数据，同意好友验证时使用
   */
  v3?: string;
  /**
   * V4数据，同意好友验证时使用
   */
  v4?: string;
  // v3 + '-' + v4
  ticket?: string;
  /**
   * 微信ID
   */
  wxid: string;
  /**
   * 微信号
   */
  wxNum: string;
  /**
   * 群成员 id
   */
  chatroommemberList?: ChatRoomMember[];
  /**
   * 群主
   */
  ownerId?: string,
  /**
   * 是否好友
   */
  isFriend?: number
  /**
   * 加好友场景 来源，1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
   */
  scene?: string
}

export interface ChatRoomMember {
  wxid: string,
  groupNick: string,
  avatar?: string,
  inviterUserName?: string
  displayName?: string
}

// 撤回 来源类型：1|好友 2|群聊
enum RevokeFromType {
  CONTACT = 1,
  ROOM = 2
}
// 撤回 消息来源：1|别人撤回 2|自己使用手机撤回 3|自己使用电脑撤回
enum RevokeMsgSourceType {
  OTHER = 1,
  SELF_PHONE = 2,
  SELF_PC = 3
}

export interface MessageRevokeInfo {
  fromType: RevokeFromType,
  msgSource: RevokeMsgSourceType,
  fromWxid: string, // fromType=1时为好友wxid，fromType=2时为群wxid
  finalFromWxid: string, // 仅fromType=2时有效，为群内撤回消息人的wxid
  msg: string // 撤回的消息内容
}

export interface Label {
  name: string,
  id: string | number
}

export interface FriendShipPayload {
  id: string,
  wxid: string,
  wxNum: string,
  nick: string,
  nickBrief: string,
  nickWhole: string,
  v3: string,
  v4: string,
  sign: string,
  country: string,
  province: string,
  city: string,
  avatarUrl: string
  avatarMinUrl: string,
  avatarMaxUrl: string,
  sex: string,
  content: string,
  scene: string,
  timestamp: number
}

export interface MusicPayLoad {
  name: string,
  author: string,
  app:string, // 酷狗/wx79f2c4418704b4f8，网易云/wx8dd6ecd81906fd84，QQ音乐/wx5aa333606550dfd5
  jumpUrl:string, // 点击后跳转地址
  musicUrl: string, // 网络歌曲直链
  imageUrl: string // 网络图片直链
}
