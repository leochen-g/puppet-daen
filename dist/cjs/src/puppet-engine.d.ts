import * as PUPPET from 'wechaty-puppet';
import type { FileBoxInterface } from 'file-box';
import type { ContactPayload, MessagePayload, MusicPayLoad } from './engine-schema.js';
import Client from './engine/service/request.js';
declare const VERSION: string;
export declare type PuppetEngineOptions = PUPPET.PuppetOptions & {
    runLocal?: boolean;
    port?: number | string | undefined;
    httpServer?: string;
    engine?: any;
};
declare class PuppetEngine extends PUPPET.Puppet {
    options: PuppetEngineOptions;
    private _cacheMgr?;
    private _client?;
    private _printVersion;
    private _heartBeatTimer?;
    static readonly VERSION: string;
    app: any;
    server: any;
    constructor(options?: PuppetEngineOptions);
    get client(): Client | undefined;
    onStart(): Promise<void>;
    /**
     * 启动监听
     * @private
     */
    private _startClient;
    private _friendRequestEvent;
    login(userId: string): Promise<void>;
    ready(): Promise<void>;
    onStop(): Promise<void>;
    private _stopClient;
    logout(): Promise<void>;
    ding(data?: string): void;
    /****************************************************************************
     * contact
     ***************************************************************************/
    /**
     *
     * ContactSelf
     *
     *
     */
    contactSelfName(name: string): Promise<void>;
    contactSelfQRCode(): Promise<string>;
    contactSelfSignature(signature: string): Promise<void>;
    contactPhone(contactId: string, phoneList: string[]): Promise<void>;
    contactAlias(contactId: string): Promise<string>;
    contactAlias(contactId: string, alias: string | null): Promise<void>;
    contactAvatar(contactId: string): Promise<FileBoxInterface>;
    contactAvatar(contactId: string, file: FileBoxInterface): Promise<void>;
    contactList(): Promise<string[]>;
    contactCorporationRemark(contactId: string, corporationRemark: string | null): Promise<never>;
    contactDescription(contactId: string, description: string | null): Promise<never>;
    contactDelete(contactId: string): Promise<void>;
    tagContactAdd(tagId: string, contactId: string): Promise<void>;
    tagContactRemove(tagId: string, contactId: string): Promise<void>;
    tagContactDelete(tagId: string): Promise<void>;
    tagContactList(contactId?: string): Promise<string[]>;
    /****************************************************************************
     * friendship
     ***************************************************************************/
    /**
     * 通过好友请求
     * @param friendshipId
     */
    friendshipAccept(friendshipId: string): Promise<void>;
    /**
     * 主动添加好友
     * @param contactId
     * @param option
     */
    friendshipAdd(contactId: string, option?: PUPPET.types.FriendshipAddOptions): Promise<void>;
    /**
     * 根据手机号查询好友
     * @param phone
     */
    friendshipSearchPhone(phone: string): Promise<null | string>;
    /**
     * 根据qq号查询好友
     * @param qq
     */
    friendshipSearchHandle(qq: string): Promise<null | string>;
    /**
     * 陌生人查询
     * @param id
     * @param scene 场景值 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
     * @private
     */
    private _friendshipSearch;
    /**
     * 根据wxid 查询群id
     * @param wxid
     * @private
     */
    private _findRoomIdForWxid;
    /****************************************************************************
     * get message payload
     ***************************************************************************/
    messageContact(messageId: string): Promise<string>;
    messageFile(messageId: string): Promise<FileBoxInterface>;
    /**
     * 解析图片消息
     * @param messageId
     */
    messageImage(messageId: string): Promise<FileBoxInterface>;
    /**
     * 解析小程序
     * @param messageId
     */
    messageMiniProgram(messageId: string): Promise<PUPPET.payloads.MiniProgram>;
    /**
     * 解析h5链接
     * @param messageId
     */
    messageUrl(messageId: string): Promise<PUPPET.payloads.UrlLink>;
    /****************************************************************************
     * send message
     ***************************************************************************/
    messageSendContact(toUserId: string, contactId: string): Promise<void>;
    messageSendFile(conversationId: string, fileBox: FileBoxInterface): Promise<void>;
    messageSendMiniProgram(toUserName: string, mpPayload: PUPPET.payloads.MiniProgram): Promise<void>;
    messageSendText(conversationId: string, text: string, mentionIdList?: string[]): Promise<string | void>;
    messageSendUrl(conversationId: string, urlLinkPayload: PUPPET.payloads.UrlLink): Promise<string | void>;
    /**
     * 确认收款
     */
    messageSendPost(conversationId: string, postPayload: PUPPET.payloads.Post): Promise<void>;
    /**
     * 确认收款
     * @param conversationId
     * @param transferid
     */
    _sendConfirmTransfer(conversationId: string, transferid: string): Promise<void>;
    /**
     * 发送音乐卡片
     * @param conversationId
     * @param musicPayLoad
     */
    _sendMusicCard(conversationId: string, musicPayLoad: MusicPayLoad): Promise<void>;
    /**
     * 消息撤回 暂不支持
     * @param messageId
     */
    messageRecall(messageId: string): Promise<boolean>;
    /**
     * 消息转发
     * @param toUserName
     * @param messageId
     */
    messageForward(toUserName: string, messageId: string): Promise<void>;
    /****************************************************************************
     * room
     ***************************************************************************/
    roomAdd(roomId: string, contactId: string): Promise<void>;
    roomAvatar(roomId: string): Promise<FileBoxInterface>;
    roomCreate(contactIdList: string[], topic: string): Promise<string>;
    roomDel(roomId: string, contactId: string): Promise<void>;
    roomList(): Promise<string[]>;
    roomQRCode(roomId: string): Promise<string>;
    roomQuit(roomId: string): Promise<void>;
    roomTopic(roomId: string): Promise<string>;
    roomTopic(roomId: string, topic: string): Promise<void>;
    roomAnnounce(roomId: string): Promise<string>;
    roomAnnounce(roomId: string, text: string): Promise<void>;
    roomMemberList(roomId: string): Promise<string[]>;
    roomInvitationAccept(roomInvitationId: string): Promise<void>;
    /****************************************************************************
     * RawPayload section
     ***************************************************************************/
    contactRawPayloadParser(payload: ContactPayload): Promise<PUPPET.payloads.Contact>;
    contactRawPayload(id: string): Promise<ContactPayload | undefined>;
    /**
     * 解析原始消息体为Wechaty支持的格式
     * @param payload
     */
    messageRawPayloadParser(payload: MessagePayload): Promise<PUPPET.payloads.Message>;
    /**
     * 根据消息id 获取消息
     * @param id
     */
    messageRawPayload(id: string): Promise<MessagePayload>;
    /**
     * 群数据格式化为Wechaty 支持类型
     * @param rawPayload
     */
    roomRawPayloadParser(payload: ContactPayload): Promise<PUPPET.payloads.Room>;
    /**
     * 查找群基础信息
     * @param id
     */
    roomRawPayload(id: string): Promise<ContactPayload | undefined>;
    /**
     * 查找群成员信息
     * @param roomId
     * @param contactId
     */
    roomMemberRawPayload(roomId: string, contactId: string): Promise<ContactPayload>;
    /**
     * 解析群成员信息
     * @param rawPayload
     */
    roomMemberRawPayloadParser(rawPayload: ContactPayload): Promise<PUPPET.payloads.RoomMember>;
    /**
     * 接收群邀请信息  暂不支持
     * @param roomInvitationId
     */
    roomInvitationRawPayload(roomInvitationId: string): Promise<any>;
    /**
     * 解析群邀请信息  暂不支持
     * @param rawPayload
     */
    roomInvitationRawPayloadParser(rawPayload: any): Promise<PUPPET.payloads.RoomInvitation>;
    /**
     * 好友申请信息解析
     * @param rawPayload
     */
    friendshipRawPayloadParser(rawPayload: PUPPET.payloads.Friendship): Promise<PUPPET.payloads.Friendship>;
    /**
     * 获取好友申请信息
     * @param id
     */
    friendshipRawPayload(id: string): Promise<PUPPET.payloads.FriendshipReceive>;
    /****************************************************************************
     * private section
     ***************************************************************************/
    private _getRoomMemberList;
    private _updateContactCache;
    private _updateRoomMember;
    /**
     * 更新群成员信息
     * @param roomId
     */
    _updateRoom(roomId: string): Promise<void>;
    private _onPushContact;
    private _onPushMessage;
    private _refreshContact;
    private _startPuppetHeart;
    private _stopPuppetHeart;
    /**
     * 解析图片
     * @param messageId
     * @param messagePayload
     * @private
     */
    private _getMessageImageFileBox;
    /**
     * 解析文件
     * @param messageId
     * @param messagePayload
     * @private
     */
    private _getMessageFileFileBox;
}
export { PuppetEngine, VERSION };
export default PuppetEngine;
//# sourceMappingURL=puppet-engine.d.ts.map