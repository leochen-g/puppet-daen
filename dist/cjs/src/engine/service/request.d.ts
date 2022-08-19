/// <reference types="node" />
/// <reference types="node" />
import { FileBoxInterface } from 'file-box';
import { EventEmitter } from 'events';
/**
 * 创建实例传过来的参数
  */
export declare type PuppetEngineOptions = {
    runLocal?: boolean;
    port?: number | string | undefined;
    httpServer?: string;
};
/**
 * 性别
 */
declare enum ContactGender {
    Unknown = 0,
    Male = 1,
    Female = 2
}
/**
 * 群成员
 */
export interface ChatRoomMember {
    wxid: string;
    groupNick: string;
    avatar?: string;
    inviterUserName?: string;
    displayName?: string;
}
/**
 * 好友 或 群 实例构造参数  务必按照此格式返回数据，否则可能报错，非必填值可以不传
 */
export interface ContactPayload {
    /**
     * 头像，需在会话列表中
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
     * 朋友圈背景图，需在会话列表中 暂时无用
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
    sex: ContactGender;
    /**
     * 签名，需在会话列表中
     */
    sign?: string;
    /**
     *  添加好友需要的ticket 票据 不同的客户端可能不同，自己构造好就行，会原样返回的 针对daen 是 v3 + '-' + v4
     */
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
/**
 * 聊天记录 此处没有用到
 */
export interface RecordList {
    wxid: string;
    nickName: string;
    timestamp: string;
    msg: string;
}
/**
 * 微信登录状态
 */
declare enum Status {
    normal = "normal",
    pending = "pending",
    fail = "fail"
}
/**
 * 登录状态
 */
export interface StatsResult {
    status: Status;
    msg: string;
    wxid?: string;
    name: string;
    wxNum?: string;
}
export declare type ClientEvent = 'kickout' | 'contact' | 'message';
/**
 * 消息来源：0|别人发送 1|自己手机发送
 * 如果是转账消息：1|收到转账 2|对方接收转账 3|发出转账 4|自己接收转账 5|对方退还 6|自己退还
 */
export declare enum MsgSource {
    OTHER = 0,
    SELF = 1,
    SIDE = 2,
    SEND = 3,
    SELF_RECIVE = 4,
    SIDE_BACK = 5,
    SELF_BACK = 6
}
/**
 * 来源类型：1|私聊 2|群聊 3|公众号
 */
declare enum FromType {
    CONTACT = 1,
    ROOM = 2,
    OFFICE = 3
}
/**
 * 消息类型：1|文本 3|图片 34|语音 42|名片 43|视频 47|动态表情 48|地理位置 49|分享链接或附件 2001|红包 2002|小程序 2003|群邀请 10000|系统消息
 */
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
/**
 * 收到的消息格式
 */
export interface MessagePayload {
    id: string;
    timeStamp: number;
    talkerId: string;
    text: string;
    fromType: FromType;
    msgType?: WechatMessageType;
    msgSource?: MsgSource;
    fromWxid: string;
    finalFromWxid: string;
    atWxidList?: string[];
    silence?: number;
    membercount?: number;
    signature?: string;
    msg: string;
    listenerId: string;
    transferid?: string;
    memo?: string;
    money?: string;
    transType?: string;
}
export interface BaseEvent {
    errorCode: number;
    errorMessage: string;
    wxid?: string;
    name?: string;
}
declare class Client extends EventEmitter {
    private readonly options;
    app: any;
    server: any;
    emit(event: 'hook', detail: BaseEvent): boolean;
    emit(event: 'login', detail: BaseEvent): boolean;
    emit(event: 'message', messageList: MessagePayload): boolean;
    emit(event: 'contact', messageList: MessagePayload): boolean;
    static create(options: PuppetEngineOptions): Promise<Client>;
    private constructor();
    initServer(): void;
    eventListen(): void;
    postData(data: any): Promise<any>;
    /**
     * 获取微信运行状态
     */
    getStats(): Promise<StatsResult>;
    /**
     * 获取微信运行状态修改下载图片
     * @param type
     * 1 “23:30-23:30”为全天下载
     * 2 “00:01-23:59”为全天不下载
     */
    setDownloadImg(type?: number): Promise<void>;
    /**
     * 获取当前bot信息
     */
    getSelfInfo(): Promise<ContactPayload>;
    /**
     * 查询对象信息
     * @param contactId
     */
    searchContact(contactId: string): Promise<ContactPayload>;
    /**
     * 获取好友列表
     * @param type 1=从缓存中获取，2=重新遍历二叉树并刷新缓存
     */
    getContactList(type?: string): Promise<ContactPayload[]>;
    /**
     * 获取群聊列表
     * @param type 1=从缓存中获取，2=重新遍历二叉树并刷新缓存
     */
    getGroupList(type?: string): Promise<ContactPayload[]>;
    /**
     * 获取群成员列表
     * @param roomId 群id
     */
    getGroupMembers(roomId: string): Promise<ChatRoomMember[]>;
    /**
     * 获公众号聊列表
     * @param type 1=从缓存中获取，2=重新遍历二叉树并刷新缓存
     */
    getOfficeList(type?: string): Promise<ContactPayload[]>;
    /**
     * 发送文本消息
     * @param contactId
     * @param msg
     * 1.消息内支持文本代码，详情见文本代码章节
     * 2.微信最多支持4096个字符，相当于2048个汉字，请勿超出否则崩溃
     */
    sendText(contactId: string, msg: string): Promise<void>;
    /**
     * 发送聊天记录
     * @param contactId 要给谁，支持好友、群聊、公众号等
     * @param title 仅供电脑上显示用，手机上的话微信会根据[显示昵称]来自动生成 谁和谁的聊天记录
     * @param dataList RecordList[] 聊天的内容
     */
    sendRecord(contactId: string, title: string, dataList: RecordList[]): Promise<void>;
    /**
     * 发送本地图片
     * @param contactId 要给谁，支持好友、群聊、公众号等
     * @param path 本地图片路径
     */
    sendLocalImg(contactId: string, path: string): Promise<void>;
    /**
     * 发送本地文件
     * @param contactId 要给谁，支持好友、群聊、公众号等
     * @param path 本地文件路径
     */
    sendLocalFile(contactId: string, path: string): Promise<void>;
    /**
     * 发送分享链接
     * @param contactId
     * @param title
     * @param content
     * @param jumpUrl 点击跳转地址
     * @param app 可空，例如QQ浏览器为：wx64f9cf5b17af074d
     * @param path 本地图片路径
     */
    sendShareCard({ contactId, title, content, jumpUrl, app, path, }: {
        contactId: string;
        title: string;
        content: string | undefined;
        jumpUrl: string;
        app?: string;
        path: string | undefined;
    }): Promise<void>;
    /**
     * 发送小程序
     * @param contactId
     * @param title
     * @param content
     * @param jumpUrl 点击跳转地址 点击跳转地址，例如饿了么首页为：pages/index/index.html
     * @param gh 例如饿了么为：gh_6506303a12bb
     * @param path 本地图片路径
     */
    sendMiniProgram({ contactId, title, content, jumpUrl, gh, path, }: {
        contactId: string | undefined;
        title: string | undefined;
        content: string | undefined;
        jumpUrl: string | undefined;
        gh: string | undefined;
        path: string | undefined;
    }): Promise<void>;
    /**
     * 发送音乐分享
     * @param contactId
     * @param title
     * @param name 歌名
     * @param author 作者
     * @param app 例如：酷狗/wx79f2c4418704b4f8，网易云/wx8dd6ecd81906fd84，QQ音乐/wx5aa333606550dfd5
     * @param jumpUrl 点击后跳转地址
     * @param musicUrl 网络歌曲直链
     * @param imageUrl 网络图片直链
     */
    sendMusic({ contactId, name, author, app, jumpUrl, musicUrl, imageUrl, }: {
        contactId: string | undefined;
        name: string | undefined;
        author: string | undefined;
        jumpUrl: string | undefined;
        musicUrl: string | undefined;
        imageUrl: string | undefined;
        app: string | undefined;
    }): Promise<void>;
    /**
     * 发送xml消息
     * XML里<fromusername>wxid_3sq4tklb6c3121</fromusername>必须为自己的wxid，切记
     * @param contactId
     * @param xml
     * 1.消息内支持文本代码，详情见文本代码章节
     * 2.微信最多支持4096个字符，相当于2048个汉字，请勿超出否则崩溃
     */
    sendXml(contactId: string, xml: string): Promise<void>;
    /**
     * 确认收款
     * @param contactId
     * @param transferid
     */
    confirmTransfer(contactId: string, transferid: string): Promise<void>;
    /**
     * 同意好友请求
     * @param scene 来源
     * @param v3 v3
     * @param v4 v4
     */
    confirmFriendship(scene: string | number | undefined, v3: string | undefined, v4: string | undefined): Promise<void>;
    /**
     * 添加好友_通过v3
     * @param scene 来源 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
     * @param v3 可通过查询陌生人信息获得
     * @param content 打招呼内容
     * @param type 1=新朋友，2=互删朋友（此时来源将固定死为3）
     */
    addFriendByV3({ scene, v3, content, type, }: {
        scene: string | undefined;
        content: string | undefined;
        type: number | undefined;
        v3: string | undefined;
    }): Promise<void>;
    /**
     * 添加好友_通过v3
     * @param scene 来源 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
     * @param content 打招呼内容
     * @param wxid wxid
     */
    addFriendByWxid({ scene, wxid, content, }: {
        scene: string | undefined;
        content: string | undefined;
        wxid: string | undefined;
    }): Promise<void>;
    /**
     * 查询陌生人信息
     * @param content 手机号或者QQ
     */
    searchStranger(content: string): Promise<ContactPayload>;
    /**
     * 邀请进群
     * @param groupId 群id
     * @param contactId 好友wxid
     * @param type 类型 1直接拉  2 发送邀请链接
     */
    inviteToGroup(groupId: string, contactId: string, type?: number): Promise<void>;
    /**
     * 删除好友
     * @param contactId 好友wxid
     */
    removeContact(contactId: string): Promise<void>;
    /**
     * 设置好友备注
     * @param contactId 好友wxid
     * @param remark 支持emoji、微信表情
     */
    setContactAlias(contactId: string, remark: string): Promise<void>;
    /**
     * 修改群名
     * @param groupId 群id
     * @param name 群名
     */
    setGroupName(groupId: string, name: string | undefined): Promise<void>;
    /**
     * 发送名片
     * @param contactId 接收人id
     * @param xml 名片xml
     */
    sendContactCard(contactId: string, xml: string | any): Promise<void>;
    /**
     * 获取登录二维码
     */
    getQrcode(): Promise<string>;
    /**
     * 获取图片数据
     */
    getImage(img: string): Promise<FileBoxInterface>;
    /**
     * 获取图片数据
     */
    getFile(name: string): Promise<Buffer>;
}
export default Client;
//# sourceMappingURL=request.d.ts.map