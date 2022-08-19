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
import type * as PUPPET from 'wechaty-puppet';
import type { WechatMessageType } from './engine/types.js';
export declare enum FromType {
    CONTACT = 1,
    ROOM = 2,
    OFFICE = 3
}
export declare enum MsgSource {
    OTHER = 0,
    SELF = 1,
    SIDE = 2,
    SEND = 3,
    SELF_RECIVE = 4,
    SIDE_BACK = 5,
    SELF_BACK = 6
}
export interface MessagePayload {
    id: string;
    timeStamp: number;
    fromType?: FromType;
    msgType?: WechatMessageType;
    msgSource?: MsgSource;
    fromWxid: string;
    finalFromWxid: string;
    atWxidList?: string[];
    silence?: number;
    membercount?: number;
    signature?: string;
    msg: string;
    msgBase64?: string;
    listenerId: string;
    transferid?: string;
    memo?: string;
    money?: string;
    transType?: string;
}
export interface ChatRoomMember {
    wxid: string;
    groupNick: string;
    avatar?: string;
    inviterUserName?: string;
    displayName?: string;
}
export declare enum SexType {
    MEN = 2,
    FEMALE = 2
}
export interface ContactPayload {
    /**
     * 头像大图，需在会话列表中
     */
    avatar: string;
    /**
     * 城市，需在会话列表中
     */
    city: string;
    /**
     * 国家，需在会话列表中
     */
    country: string;
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
    name: string;
    /**
     * 省份，需在会话列表中
     */
    province: string;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 性别，1=男，2=女
     */
    sex: PUPPET.types.ContactGender;
    /**
     * 签名，需在会话列表中
     */
    sign?: string;
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
    ownerId?: string;
    /**
     * 是否好友
     */
    isFriend?: number;
    /**
     * 加好友场景 来源，1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
     */
    scene?: string;
}
declare enum RevokeFromType {
    CONTACT = 1,
    ROOM = 2
}
declare enum RevokeMsgSourceType {
    OTHER = 1,
    SELF_PHONE = 2,
    SELF_PC = 3
}
export interface MessageRevokeInfo {
    fromType: RevokeFromType;
    msgSource: RevokeMsgSourceType;
    fromWxid: string;
    finalFromWxid: string;
    msg: string;
}
export interface Label {
    name: string;
    id: string | number;
}
export interface MusicPayLoad {
    name: string;
    author: string;
    app: string;
    jumpUrl: string;
    musicUrl: string;
    imageUrl: string;
}
export {};
//# sourceMappingURL=engine-schema.d.ts.map