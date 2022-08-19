import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';
import { log } from 'wechaty-puppet';
import { FileBox } from 'file-box';
import { EventEmitter } from 'events';
import http from 'http';
// 为了生成随机id使用 如果接口自带 此处可不引用
import cuid from 'cuid';
const PRE = '[PuppetEngine]';
/**
 * 性别
 */
var ContactGender;
(function (ContactGender) {
    ContactGender[ContactGender["Unknown"] = 0] = "Unknown";
    ContactGender[ContactGender["Male"] = 1] = "Male";
    ContactGender[ContactGender["Female"] = 2] = "Female";
})(ContactGender || (ContactGender = {}));
/**
 * 微信登录状态
 */
var Status;
(function (Status) {
    Status["normal"] = "normal";
    Status["pending"] = "pending";
    Status["fail"] = "fail";
})(Status || (Status = {}));
/**
 * 消息来源：0|别人发送 1|自己手机发送
 * 如果是转账消息：1|收到转账 2|对方接收转账 3|发出转账 4|自己接收转账 5|对方退还 6|自己退还
 */
export var MsgSource;
(function (MsgSource) {
    MsgSource[MsgSource["OTHER"] = 0] = "OTHER";
    MsgSource[MsgSource["SELF"] = 1] = "SELF";
    MsgSource[MsgSource["SIDE"] = 2] = "SIDE";
    MsgSource[MsgSource["SEND"] = 3] = "SEND";
    MsgSource[MsgSource["SELF_RECIVE"] = 4] = "SELF_RECIVE";
    MsgSource[MsgSource["SIDE_BACK"] = 5] = "SIDE_BACK";
    MsgSource[MsgSource["SELF_BACK"] = 6] = "SELF_BACK";
})(MsgSource || (MsgSource = {}));
/**
 * 来源类型：1|私聊 2|群聊 3|公众号
 */
var FromType;
(function (FromType) {
    FromType[FromType["CONTACT"] = 1] = "CONTACT";
    FromType[FromType["ROOM"] = 2] = "ROOM";
    FromType[FromType["OFFICE"] = 3] = "OFFICE";
})(FromType || (FromType = {}));
/**
 * 消息类型：1|文本 3|图片 34|语音 42|名片 43|视频 47|动态表情 48|地理位置 49|分享链接或附件 2001|红包 2002|小程序 2003|群邀请 10000|系统消息
 */
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
class Client extends EventEmitter {
    options;
    app;
    server;
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    static async create(options) {
        return new Client(options);
    }
    constructor(options = {}) {
        super();
        this.options = options;
        this.initServer();
    }
    initServer() {
        if (!this.app && !this.server) {
            this.app = express();
            this.app.use(bodyParser.json({ limit: '200mb' }));
            this.app.use(bodyParser.urlencoded({ extended: true }));
            this.server = http.createServer(this.app);
            const _port = this.options.port;
            this.server.listen(_port, () => {
                log.info(PRE, `Server is running on ${_port}`);
            });
            this.eventListen();
        }
    }
    eventListen() {
        this.app.post('/wechat/', async (req, res) => {
            const { type, data, wxid } = req.body;
            // response according to message type
            log.info(PRE, `on event:${JSON.stringify(data)}`);
            switch (type) {
                case 'D0001':
                    this.emit('hook', { errorCode: 0, errorMessage: 'success' });
                    break;
                case 'D0002':
                    log.info(PRE, 'login event');
                    this.emit('login', { errorCode: 0, errorMessage: 'success', name: data.nick, wxid });
                    break;
                case 'D0003': {
                    log.info(PRE, 'recive message');
                    const msg = {
                        ...data,
                        text: data.msg,
                        avatar: data.avatarMaxUrl || data.avatarMinUrl || data.avatarUrl || '',
                        id: cuid(),
                        listenerId: wxid,
                    };
                    this.emit('message', msg);
                    break;
                }
                case 'D0004': {
                    log.info(PRE, 'transfer message');
                    const transferMsg = {
                        ...data,
                        id: cuid(),
                        listenerId: wxid,
                        text: data.money + '-' + data.transferid + '-' + data.memo,
                        msg: data.money + '-' + data.transferid + '-' + data.memo,
                        msgType: WechatMessageType.Transfer,
                        timeStamp: Number(data.invalidtime),
                    };
                    this.emit('message', transferMsg);
                    break;
                }
                case 'D0005':
                    log.info(PRE, 'recall message');
                    break;
                case 'D0006': {
                    log.info(PRE, 'friend request');
                    const friendShip = {
                        ...data,
                        contactId: data.wxid,
                        hello: data.content,
                        id: cuid(),
                        scene: Number(data.scene),
                        ticket: data.v3 + '-' + data.v4,
                        timestamp: Number(data.timestamp),
                        type: 2,
                    };
                    this.emit('contact', friendShip);
                    break;
                }
            }
            res.status(200).json({
                code: 200,
                msg: 'ok',
                timestamp: '1657121317965',
            });
            return null;
        });
    }
    async postData(data) {
        try {
            const res = await axios({
                data,
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                url: this.options.httpServer + '/DaenWxHook/client/',
            });
            const result = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            if (parseInt(result.code) === 200) {
                return Array.isArray(result.result) ? result.result : { ...result.result, robotId: result.wxid };
            }
            else {
                log.info(PRE, `Error: onPost${result}`);
                return { code: Number(result.code), errorMsg: result.msg, result: result.result };
            }
        }
        catch (e) {
            log.error('post error', e);
        }
    }
    /**
     * 获取微信运行状态
     */
    async getStats() {
        const res = await this.postData({
            data: {},
            type: 'Q0000',
        });
        if (res) {
            const { code, errorMsg, wxid, nick } = res;
            if (!code) {
                return { status: Status.normal, wxid, msg: errorMsg, name: nick };
            }
            else {
                return { status: Status.pending, wxid, msg: errorMsg, name: nick };
            }
        }
        else {
            log.info(PRE, 'login fail');
            return { status: Status.fail, wxid: '', msg: '未启动微信或未注入成功', name: ' ' };
        }
    }
    /**
     * 获取微信运行状态修改下载图片
     * @param type
     * 1 “23:30-23:30”为全天下载
     * 2 “00:01-23:59”为全天不下载
     */
    async setDownloadImg(type = 1) {
        const typeMap = {
            1: '23:30-23:30',
            2: '00:01-23:59',
        };
        return await this.postData({
            data: {
                type: typeMap[type],
            },
            type: 'Q0002',
        });
    }
    /**
     * 获取当前bot信息
     */
    async getSelfInfo() {
        const selfContact = await this.postData({
            type: 'Q0003',
            data: {},
        });
        selfContact['name'] = selfContact.nick;
        return selfContact;
    }
    /**
     * 查询对象信息
     * @param contactId
     */
    async searchContact(contactId) {
        const contact = await this.postData({
            type: 'Q0004',
            data: {
                wxid: contactId,
            },
        });
        return {
            ...contact,
            name: contact.nick,
            avatar: contact.avatarMaxUrl | contact.avatarMinUrl,
        };
    }
    /**
     * 获取好友列表
     * @param type 1=从缓存中获取，2=重新遍历二叉树并刷新缓存
     */
    async getContactList(type = '1') {
        const list = await this.postData({
            type: 'Q0005',
            data: {
                type: type,
            },
        });
        const contactList = list.map((item) => {
            return {
                ...item,
                name: item.nick,
                avatar: item.avatarMaxUrl || item.avatarMinUrl,
            };
        });
        return contactList;
    }
    /**
     * 获取群聊列表
     * @param type 1=从缓存中获取，2=重新遍历二叉树并刷新缓存
     */
    async getGroupList(type = '1') {
        const list = await this.postData({
            type: 'Q0006',
            data: {
                type: type,
            },
        });
        const groupList = list.map((item) => {
            return {
                ...item,
                name: item.nick,
                avatar: item.avatarMaxUrl || item.avatarMinUrl,
            };
        });
        return groupList;
    }
    /**
     * 获取群成员列表
     * @param roomId 群id
     */
    async getGroupMembers(roomId) {
        const list = await this.postData({
            type: 'Q0008',
            data: {
                wxid: roomId,
            },
        });
        return list;
    }
    /**
     * 获公众号聊列表
     * @param type 1=从缓存中获取，2=重新遍历二叉树并刷新缓存
     */
    async getOfficeList(type = '1') {
        const list = await this.postData({
            type: 'Q0007',
            data: {
                type: type,
            },
        });
        return list;
    }
    /**
     * 发送文本消息
     * @param contactId
     * @param msg
     * 1.消息内支持文本代码，详情见文本代码章节
     * 2.微信最多支持4096个字符，相当于2048个汉字，请勿超出否则崩溃
     */
    async sendText(contactId, msg) {
        await this.postData({
            type: 'Q0001',
            data: {
                wxid: contactId,
                msg: msg,
            },
        });
    }
    /**
     * 发送聊天记录
     * @param contactId 要给谁，支持好友、群聊、公众号等
     * @param title 仅供电脑上显示用，手机上的话微信会根据[显示昵称]来自动生成 谁和谁的聊天记录
     * @param dataList RecordList[] 聊天的内容
     */
    async sendRecord(contactId, title, dataList) {
        await this.postData({
            type: 'Q0009',
            data: {
                wxid: contactId,
                title: title,
                dataList: dataList,
            },
        });
    }
    /**
     * 发送本地图片
     * @param contactId 要给谁，支持好友、群聊、公众号等
     * @param path 本地图片路径
     */
    async sendLocalImg(contactId, path) {
        await this.postData({
            data: {
                path: path,
                wxid: contactId,
            },
            type: 'Q0010',
        });
    }
    /**
     * 发送本地文件
     * @param contactId 要给谁，支持好友、群聊、公众号等
     * @param path 本地文件路径
     */
    async sendLocalFile(contactId, path) {
        await this.postData({
            type: 'Q0011',
            data: {
                wxid: contactId,
                path: path,
            },
        });
    }
    /**
     * 发送分享链接
     * @param contactId
     * @param title
     * @param content
     * @param jumpUrl 点击跳转地址
     * @param app 可空，例如QQ浏览器为：wx64f9cf5b17af074d
     * @param path 本地图片路径
     */
    async sendShareCard({ contactId, title, content, jumpUrl, app, path, }) {
        await this.postData({
            type: 'Q0012',
            data: {
                wxid: contactId,
                title: title,
                content: content,
                jumpUrl: jumpUrl,
                app: app,
                path: path,
            },
        });
    }
    /**
     * 发送小程序
     * @param contactId
     * @param title
     * @param content
     * @param jumpUrl 点击跳转地址 点击跳转地址，例如饿了么首页为：pages/index/index.html
     * @param gh 例如饿了么为：gh_6506303a12bb
     * @param path 本地图片路径
     */
    async sendMiniProgram({ contactId, title, content, jumpUrl, gh, path, }) {
        await this.postData({
            type: 'Q0013',
            data: {
                wxid: contactId,
                title: title,
                content: content,
                jumpPath: jumpUrl,
                gh: gh,
                path: path,
            },
        });
    }
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
    async sendMusic({ contactId, name, author, app, jumpUrl, musicUrl, imageUrl, }) {
        await this.postData({
            type: 'Q0014',
            data: {
                wxid: contactId,
                name: name,
                author: author,
                app: app,
                jumpUrl: jumpUrl,
                musicUrl: musicUrl,
                imageUrl: imageUrl,
            },
        });
    }
    /**
     * 发送xml消息
     * XML里<fromusername>wxid_3sq4tklb6c3121</fromusername>必须为自己的wxid，切记
     * @param contactId
     * @param xml
     * 1.消息内支持文本代码，详情见文本代码章节
     * 2.微信最多支持4096个字符，相当于2048个汉字，请勿超出否则崩溃
     */
    async sendXml(contactId, xml) {
        await this.postData({
            type: 'Q0001',
            data: {
                wxid: contactId,
                xml: xml,
            },
        });
    }
    /**
     * 确认收款
     * @param contactId
     * @param transferid
     */
    async confirmTransfer(contactId, transferid) {
        await this.postData({
            type: 'Q0016',
            data: {
                wxid: contactId,
                transferid: transferid,
            },
        });
    }
    /**
     * 同意好友请求
     * @param scene 来源
     * @param v3 v3
     * @param v4 v4
     */
    async confirmFriendship(scene, v3, v4) {
        await this.postData({
            type: 'Q0017',
            data: {
                scene: scene && scene.toString(),
                v3: v3,
                v4: v4,
            },
        });
    }
    /**
     * 添加好友_通过v3
     * @param scene 来源 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
     * @param v3 可通过查询陌生人信息获得
     * @param content 打招呼内容
     * @param type 1=新朋友，2=互删朋友（此时来源将固定死为3）
     */
    async addFriendByV3({ scene, v3, content, type, }) {
        await this.postData({
            type: 'Q0018',
            data: {
                scene: scene,
                v3: v3,
                content: content,
                type: type,
            },
        });
    }
    /**
     * 添加好友_通过v3
     * @param scene 来源 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
     * @param content 打招呼内容
     * @param wxid wxid
     */
    async addFriendByWxid({ scene, wxid, content, }) {
        await this.postData({
            type: 'Q0019',
            data: {
                scene: scene,
                wxid: wxid,
                content: content,
            },
        });
    }
    /**
     * 查询陌生人信息
     * @param content 手机号或者QQ
     */
    async searchStranger(content) {
        const res = await this.postData({
            type: 'Q0020',
            data: {
                pq: content,
            },
        });
        return {
            ...res,
            name: res.nick,
            ticket: res.v3 + '-' + res.v4,
            avatarUrl: res.avatarMaxUrl || res.avatarMinUrl || '',
            wxid: res.isFriend === '1' ? res.pq : '',
            isFriend: Number(res.isFriend),
        };
    }
    /**
     * 邀请进群
     * @param groupId 群id
     * @param contactId 好友wxid
     * @param type 类型 1直接拉  2 发送邀请链接
     */
    async inviteToGroup(groupId, contactId, type = 1) {
        await this.postData({
            type: 'Q0021',
            data: {
                wxid: groupId,
                objWxid: contactId,
                type: type,
            },
        });
    }
    /**
     * 删除好友
     * @param contactId 好友wxid
     */
    async removeContact(contactId) {
        await this.postData({
            type: 'Q0022',
            data: {
                wxid: contactId,
            },
        });
    }
    /**
     * 设置好友备注
     * @param contactId 好友wxid
     * @param remark 支持emoji、微信表情
     */
    async setContactAlias(contactId, remark) {
        await this.postData({
            type: 'Q0023',
            data: {
                wxid: contactId,
                remark: remark,
            },
        });
    }
    /**
     * 修改群名
     * @param groupId 群id
     * @param name 群名
     */
    async setGroupName(groupId, name) {
        await this.postData({
            type: 'Q0024',
            data: {
                wxid: groupId,
                nick: name,
            },
        });
    }
    /**
     * 发送名片
     * @param contactId 接收人id
     * @param xml 名片xml
     */
    async sendContactCard(contactId, xml) {
        await this.postData({
            type: 'Q0025',
            data: {
                wxid: contactId,
                nick: xml,
            },
        });
    }
    /**
     * 获取登录二维码
     */
    async getQrcode() {
        const res = await this.postData({
            type: 'Q0026',
            data: {},
        });
        return res.qrcode || '';
    }
    /**
     * 获取图片数据
     */
    async getImage(img) {
        return FileBox.fromUrl(`${this.options.httpServer}/DaenWxHook/client/view/?name=${img}`);
    }
    /**
     * 获取图片数据
     */
    async getFile(name) {
        const curDate = new Date();
        const year = curDate.getFullYear();
        let month = curDate.getMonth() + 1;
        if (month < 10) {
            month = '0' + month;
        }
        const res = await axios.get(this.options.httpServer + '/DaenWxHook/client/down/', {
            params: {
                name,
                date: `${year}-${month}`,
            },
        });
        return res.data;
    }
}
export default Client;
//# sourceMappingURL=request.js.map