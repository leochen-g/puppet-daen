"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.PuppetEngine = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const wechaty_puppet_1 = require("wechaty-puppet");
const PUPPET = __importStar(require("wechaty-puppet"));
const file_box_1 = require("file-box");
const request_js_1 = __importDefault(require("./engine/service/request.js"));
const image_decrypt_js_1 = require("./engine/utils/image-decrypt.js");
const index_js_1 = require("./engine/utils/index.js");
// 参考
const cache_manager_js_1 = require("./engine/cache-manager.js");
const is_type_js_1 = require("./engine/utils/is-type.js");
const message_appmsg_js_1 = require("./engine/messages/message-appmsg.js");
const message_miniprogram_js_1 = require("./engine/messages/message-miniprogram.js");
const message_emotion_js_1 = require("./engine/messages/message-emotion.js");
const cached_promise_js_1 = require("./engine/utils/cached-promise.js");
const message_js_1 = require("./engine/schema-mapper/message.js");
const contact_js_1 = require("./engine/schema-mapper/contact.js");
const room_js_1 = require("./engine/schema-mapper/room.js");
const event_room_leave_js_1 = require("./engine/events/event-room-leave.js");
const mod_js_1 = require("./engine/events/mod.js");
const cleanup_js_1 = require("./cleanup.js");
const package_json_js_1 = require("./package-json.js");
const xml_to_json_js_1 = require("./engine/utils/xml-to-json.js");
const VERSION = package_json_js_1.packageJson.version || '0.0.0';
exports.VERSION = VERSION;
const PRE = '[PuppetEngine]';
const SEARCH_CONTACT_PREFIX = '$search$-';
const STRANGER_SUFFIX = '@stranger';
class PuppetEngine extends PUPPET.Puppet {
    options;
    _cacheMgr;
    _client;
    _printVersion = true;
    _heartBeatTimer;
    static VERSION = VERSION;
    app;
    server;
    constructor(options = {}) {
        super(options);
        this.options = options;
        if (!this.options.engine) {
            this.options.engine = request_js_1.default;
        }
        // 服务是不是跑在本地 默认为跑在本地
        if (this.options.runLocal === undefined) {
            this.options.runLocal = true;
        }
        if (!this.options.port) {
            const port = process.env['WECHATY_PUPPET_ENGINE_PORT'] || '8089';
            if (port) {
                this.options.port = port;
            }
        }
        if (!this.options.httpServer) {
            const httpServer = process.env['WECHATY_PUPPET_ENGINE_HTTPSERVER'] || 'http://127.0.0.1:8055/DaenWxHook/client/';
            if (httpServer) {
                this.options.httpServer = httpServer;
            }
        }
    }
    get client() {
        return this._client;
    }
    async onStart() {
        wechaty_puppet_1.log.verbose(PRE, 'onStart()');
        // this.app = express()
        // this.app.use(bodyParser.json({ limit: '200mb' }))
        // this.app.use(bodyParser.urlencoded({ extended: true }))
        // this.server = http.createServer(this.app)
        //
        // const _port = this.options.port
        // this.server.listen(_port, async () => {
        //   log.info(PRE, `Server is running on ${_port}`)
        // })
        await this._startClient();
    }
    /**
     * 启动监听
     * @private
     */
    async _startClient() {
        this._client = await this.options.engine.create(this.options);
        await this._startPuppetHeart(true);
        if (this._client) {
            this._client.on('hook', () => {
                wechaty_puppet_1.log.info(PRE, 'hook success');
            });
            this._client.on('login', this.wrapAsync(async ({ wxid, name }) => {
                wechaty_puppet_1.log.info(PRE, `login success: ${name}`);
                await this.login(wxid);
            }));
            this._client.on('message', this.wrapAsync(async (message) => {
                await this._onPushMessage(message);
            }));
            this._client.on('contact', this.wrapAsync(async (friendShip) => {
                await this._friendRequestEvent(friendShip);
            }));
        }
        (0, cleanup_js_1.addRunningPuppet)(this);
        if (this._printVersion) {
            // only print once
            this._printVersion = false;
            wechaty_puppet_1.log.info(`
      ============================================================
       Welcome to Wechaty Engine puppet!

       - puppet-Engine version: ${VERSION}
      ============================================================
    `);
        }
    }
    // 好友请求事件监听
    async _friendRequestEvent(Message) {
        await this._cacheMgr.setFriendshipRawPayload(Message.contactId, Message);
        this.emit('friendship', {
            friendshipId: Message.contactId,
        });
    }
    // 登录
    async login(userId) {
        try {
            // create cache manager firstly
            if (!this._client) {
                this._client = await this.options.engine.create(this.options);
            }
            this._cacheMgr = new cache_manager_js_1.CacheManager(userId);
            await this._cacheMgr.init();
            await super.login(userId);
            const oldContact = await this._cacheMgr.getContact(this.currentUserId);
            if (!oldContact && this._client) {
                // 获取机器人信息
                const selfContact = await this._client.getSelfInfo();
                await this._updateContactCache(selfContact);
            }
            await this.ready();
        }
        catch (e) {
            wechaty_puppet_1.log.error('error login', e);
        }
    }
    async ready() {
        try {
            const contactList = await this._client?.getContactList('2') || [];
            for (const contact of contactList) {
                await this._onPushContact(contact);
            }
            const roomList = await this._client?.getGroupList('2') || [];
            for (const contact of roomList) {
                await this._onPushContact(contact);
            }
            const officeList = await this._client?.getOfficeList('2') || [];
            for (const contact of officeList) {
                await this._onPushContact(contact);
            }
            wechaty_puppet_1.log.silly(PRE, 'on ready');
            setTimeout(() => {
                this._client?.setDownloadImg(1).then(() => {
                    wechaty_puppet_1.log.info('set download all day');
                    return '';
                }).catch(e => {
                    wechaty_puppet_1.log.error('set download all day', e);
                });
            }, 3000);
            this.emit('ready', {
                data: 'ready',
            });
        }
        catch (e) {
            wechaty_puppet_1.log.error('ready error', e);
        }
    }
    async onStop() {
        await this._stopClient();
    }
    async _stopClient() {
        this.__currentUserId = undefined;
        this.__currentUserId = undefined;
        if (this._cacheMgr) {
            wechaty_puppet_1.log.info(PRE, 'colse cache');
            await this._cacheMgr.close();
            this._cacheMgr = undefined;
        }
        (0, cleanup_js_1.removeRunningPuppet)(this);
        this._stopPuppetHeart();
    }
    // 登出
    async logout() {
        if (!this.isLoggedIn) {
            return;
        }
        this.emit('logout', { contactId: this.currentUserId, data: 'logout by self' });
        await this._stopClient();
    }
    ding(data) {
        const eventDongPayload = {
            data: data ? data : 'ding-dong',
        };
        this.emit('dong', eventDongPayload);
    }
    /****************************************************************************
     * contact
     ***************************************************************************/
    /**
     *
     * ContactSelf
     *
     *
     */
    // 设置自己的昵称 暂不支持
    async contactSelfName(name) {
        return PUPPET.throwUnsupportedError(name);
    }
    // 获取自己的二维码 暂不支持
    async contactSelfQRCode() {
        return PUPPET.throwUnsupportedError();
    }
    // 设置自己的签名 暂不支持
    async contactSelfSignature(signature) {
        return PUPPET.throwUnsupportedError(signature);
    }
    // 获取用户的手机号 暂不支持
    async contactPhone(contactId, phoneList) {
        return PUPPET.throwUnsupportedError(contactId, phoneList);
    }
    async contactAlias(contactId, alias) {
        const contact = await this.contactRawPayload(contactId);
        if (alias) {
            // contact is stranger, set alias in cache, to update after user is added
            if (contact) {
                if (contact.wxid.indexOf(STRANGER_SUFFIX) !== -1) {
                    await this._cacheMgr.setContactStrangerAlias(contact.wxid, alias);
                    // to suppress warning: 15:31:06 WARN Contact alias(asd3) sync with server fail: set(asd3) is not equal to get()
                    if (contactId.startsWith(SEARCH_CONTACT_PREFIX)) {
                        const searchContact = await this._cacheMgr?.getContactSearch(contactId);
                        if (searchContact) {
                            searchContact.remark = alias;
                            await this._cacheMgr.setContactSearch(contactId, searchContact);
                        }
                    }
                }
                else {
                    await this._client?.setContactAlias(contactId, alias);
                    contact.remark = alias;
                    await this._updateContactCache(contact);
                }
            }
        }
        else {
            return contact && contact.remark;
        }
    }
    async contactAvatar(contactId, file) {
        if (file) {
            return PUPPET.throwUnsupportedError('set avatar is not unsupported');
        }
        const contact = await this.contactRawPayload(contactId);
        if (contact) {
            return file_box_1.FileBox.fromUrl(contact.avatar, { name: `avatar-${contactId}.jpg` });
        }
    }
    // 获取用户列表
    async contactList() {
        return this._cacheMgr.getContactIds();
    }
    // 公司备注 暂不支持
    async contactCorporationRemark(contactId, corporationRemark) {
        return PUPPET.throwUnsupportedError(contactId, corporationRemark);
    }
    // 其他备注 暂不支持
    async contactDescription(contactId, description) {
        return PUPPET.throwUnsupportedError(contactId, description);
    }
    // 删除联系人
    async contactDelete(contactId) {
        const contact = await this._refreshContact(contactId);
        if (contact && contact.isFriend === 2) {
            wechaty_puppet_1.log.warn(`can not delete contact which is not a friend:: ${contactId}`);
            return;
        }
        await this._client?.removeContact(contactId);
        await this._refreshContact(contactId, 2);
    }
    // 添加标签 暂不支持
    async tagContactAdd(tagId, contactId) {
        return PUPPET.throwUnsupportedError(tagId, contactId);
    }
    // 删除用户标签 暂不支持
    async tagContactRemove(tagId, contactId) {
        return PUPPET.throwUnsupportedError(tagId, contactId);
    }
    // 删除标签
    async tagContactDelete(tagId) {
        return PUPPET.throwUnsupportedError(tagId);
    }
    // 获取用户标签
    async tagContactList(contactId) {
        return PUPPET.throwUnsupportedError(contactId);
    }
    /****************************************************************************
     * friendship
     ***************************************************************************/
    /**
     * 通过好友请求
     * @param friendshipId
     */
    async friendshipAccept(friendshipId) {
        const friendship = (await this.friendshipRawPayload(friendshipId));
        const userName = friendship.contactId;
        // FIXME: workaround to make accept enterprise account work. can be done in a better way
        if ((0, is_type_js_1.isIMContactId)(userName)) {
            await this._refreshContact(userName);
        }
        await this._client?.confirmFriendship(friendship.scene, friendship.ticket.split('-')[0], friendship.ticket.split('-')[1]);
    }
    /**
     * 主动添加好友
     * @param contactId
     * @param option
     */
    async friendshipAdd(contactId, option) {
        let stranger;
        let ticket;
        let addContactScene;
        let addType;
        const cachedContactSearch = await this._cacheMgr.getContactSearch(contactId);
        // 通过陌生人查找用户 手机或者qq
        if (cachedContactSearch) {
            stranger = cachedContactSearch.isFriend || undefined;
            ticket = cachedContactSearch.ticket || '';
            addContactScene = cachedContactSearch.scene;
            addType = 'v3';
        }
        else {
            // 通过wxid 查找
            const contactPayload = await this.contactRawPayload(contactId);
            const contactAlias = contactPayload?.remark;
            if (!contactAlias) {
                // add contact from room,
                const roomIds = await this._findRoomIdForWxid(contactId);
                if (!roomIds.length) {
                    throw new Error(`Can not find room for contact while adding friendship: ${contactId}`);
                }
                const res = await this._client?.searchContact(contactId);
                if (res) {
                    await this._updateContactCache(res);
                }
                addContactScene = '14'; // 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
            }
            const res = await this.contactRawPayload(contactId);
            if (res?.isFriend === 1) {
                throw new Error(`contact:${contactId} is already a friend`);
            }
            // 通过wxid加好友
            ticket = '';
            addContactScene = '6'; // 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
            addType = 'wxid';
        }
        let hello;
        if (stranger === 1) {
            throw new Error(`contact:${contactId} is already a friend`);
        }
        if (option) {
            if (typeof option === 'string') {
                hello = option;
            }
            else {
                hello = option.hello;
            }
        }
        if (addType === 'v3') {
            await this._client?.addFriendByV3({ content: hello, scene: addContactScene, type: 1, v3: ticket.split('-')[0] });
        }
        else if (addType === 'wxid') {
            await this._client?.addFriendByWxid({ content: hello, scene: addContactScene, wxid: contactId });
        }
    }
    /**
     * 根据手机号查询好友
     * @param phone
     */
    async friendshipSearchPhone(phone) {
        return this._friendshipSearch(phone, '15');
    }
    /**
     * 根据qq号查询好友
     * @param qq
     */
    async friendshipSearchHandle(qq) {
        return this._friendshipSearch(qq, '1');
    }
    /**
     * 陌生人查询
     * @param id
     * @param scene 场景值 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
     * @private
     */
    async _friendshipSearch(id, scene) {
        const cachedContactSearch = await this._cacheMgr.getContactSearch(id);
        if (cachedContactSearch) {
            return id;
        }
        const res = await this._client?.searchStranger(id);
        const searchId = `${SEARCH_CONTACT_PREFIX}${id}`;
        if (res) {
            await this._cacheMgr.setContactSearch(searchId, { ...res, scene: scene });
        }
        return searchId;
    }
    /**
     * 根据wxid 查询群id
     * @param wxid
     * @private
     */
    async _findRoomIdForWxid(wxid) {
        const ret = [];
        const roomIds = (await this._cacheMgr?.getRoomIds()) || [];
        for (const roomId of roomIds) {
            const roomMember = await this._cacheMgr?.getRoomMember(roomId);
            if (!roomMember) {
                continue;
            }
            const roomMemberIds = Object.keys(roomMember);
            if (roomMemberIds.indexOf(wxid) !== -1) {
                ret.push(roomId);
            }
        }
        return ret;
    }
    /****************************************************************************
     * get message payload
     ***************************************************************************/
    // 名片
    async messageContact(messageId) {
        wechaty_puppet_1.log.verbose('PuppetWeChat', 'messageContact(%s)', messageId);
        return PUPPET.throwUnsupportedError(messageId);
    }
    // 文件消息
    async messageFile(messageId) {
        const messagePayload = await this.messageRawPayload(messageId);
        const message = await this.messageRawPayloadParser(messagePayload);
        switch (message.type) {
            // 图片
            case PUPPET.types.Message.Image:
                return this._getMessageImageFileBox(messageId, messagePayload);
            case PUPPET.types.Message.Audio:
                return PUPPET.throwUnsupportedError(messageId);
            case PUPPET.types.Message.Video: {
                return PUPPET.throwUnsupportedError(messageId);
            }
            case PUPPET.types.Message.Attachment:
                if (message.text && message.text.includes('[file=')) {
                    return this._getMessageFileFileBox(messageId, messagePayload);
                }
                return PUPPET.throwUnsupportedError(messageId);
            case PUPPET.types.Message.Emoticon: {
                const emotionPayload = await (0, message_emotion_js_1.parseEmotionMessagePayload)(messagePayload);
                const emoticonBox = file_box_1.FileBox.fromUrl(emotionPayload.cdnurl, { name: `message-${messageId}-emoticon.jpg` });
                emoticonBox.metadata = {
                    payload: emotionPayload,
                    type: 'emoticon',
                };
                return emoticonBox;
            }
            case PUPPET.types.Message.MiniProgram:
                return PUPPET.throwUnsupportedError(messageId);
            case PUPPET.types.Message.Url:
                return PUPPET.throwUnsupportedError(messageId);
            default:
                throw new Error(`Can not get file for message: ${messageId}`);
        }
    }
    /**
     * 解析图片消息
     * @param messageId
     */
    async messageImage(messageId) {
        const messagePayload = await this.messageRawPayload(messageId);
        return this._getMessageImageFileBox(messageId, messagePayload);
    }
    /**
     * 解析小程序
     * @param messageId
     */
    async messageMiniProgram(messageId) {
        const messagePayload = await this.messageRawPayload(messageId);
        const message = await this.messageRawPayloadParser(messagePayload);
        if (message.type !== PUPPET.types.Message.MiniProgram) {
            throw new Error('message is not mini program, can not get MiniProgramPayload');
        }
        return (0, message_miniprogram_js_1.parseMiniProgramMessagePayload)(messagePayload);
    }
    /**
     * 解析h5链接
     * @param messageId
     */
    async messageUrl(messageId) {
        const rawPayload = await this.messageRawPayload(messageId);
        const payload = await this.messageRawPayloadParser(rawPayload);
        if (payload.type !== PUPPET.types.Message.Url) {
            throw new Error('Can not get url from non url payload');
        }
        // FIXME: thumb may not in appPayload.thumburl, but in appPayload.appAttachPayload
        const appPayload = await (0, message_appmsg_js_1.parseAppmsgMessagePayload)(rawPayload.msg);
        return {
            description: appPayload.des,
            thumbnailUrl: appPayload.thumburl,
            title: appPayload.title,
            url: appPayload.url,
        };
    }
    /****************************************************************************
     * send message
     ***************************************************************************/
    // 发送名片
    async messageSendContact(toUserId, contactId) {
        wechaty_puppet_1.log.verbose('PuppetWeChat', 'messageSend("%s", %s)', toUserId, contactId);
        const contactPayload = await this.contactRawPayload(contactId);
        const xmlObj = {
            msg: {
                antispamticket: '',
                bigheadimgurl: contactPayload?.avatar,
                brandFlags: '0',
                certflag: '0',
                city: contactPayload?.city,
                fullpy: contactPayload?.name,
                imagestatus: '3',
                nickname: contactPayload?.name,
                province: contactPayload?.province,
                regionCode: 'CN_Shanghai',
                scene: '17',
                sex: contactPayload?.sex,
                smallheadimgurl: contactPayload?.avatar,
                username: contactPayload?.ticket,
            },
        };
        const xml = (0, xml_to_json_js_1.JsonToXml)(xmlObj);
        await this._client?.sendContactCard(toUserId, xml);
    }
    // 发送文件
    async messageSendFile(conversationId, fileBox) {
        const metadata = fileBox.metadata;
        if (metadata.type === 'emoticon') {
            PUPPET.throwUnsupportedError(conversationId, fileBox);
        }
        else if (fileBox.mediaType.startsWith('image/')) {
            if (this.options.runLocal) {
                const filePath = path_1.default.resolve(fileBox.name);
                wechaty_puppet_1.log.verbose('filePath===============', filePath);
                await fileBox.toFile(filePath, true);
                await this._client?.sendLocalImg(conversationId, filePath);
                fs_1.default.unlinkSync(filePath);
            }
            else {
                const buffer = await fileBox.toBuffer();
                const cdnUrl = await (0, index_js_1.putFileTransfer)(fileBox.name, buffer);
                await this._client?.sendLocalImg(conversationId, cdnUrl);
            }
        }
        else if (fileBox.mediaType === 'audio/silk') {
            PUPPET.throwUnsupportedError(conversationId, fileBox);
        }
        else {
            if (this.options.runLocal) {
                const filePath = path_1.default.resolve(fileBox.name);
                wechaty_puppet_1.log.verbose('filePath===============', filePath);
                await fileBox.toFile(filePath, true);
                await this._client?.sendLocalFile(conversationId, filePath);
                fs_1.default.unlinkSync(filePath);
            }
            else {
                const buffer = await fileBox.toBuffer();
                const cdnUrl = await (0, index_js_1.putFileTransfer)(fileBox.name, buffer);
                await this._client?.sendLocalFile(conversationId, cdnUrl);
            }
        }
    }
    // 发送小程序
    async messageSendMiniProgram(toUserName, mpPayload) {
        const miniProgram = {
            contactId: toUserName,
            content: mpPayload.description,
            gh: mpPayload.username,
            jumpUrl: mpPayload.pagePath,
            path: mpPayload.thumbUrl,
            title: mpPayload.title,
        };
        if (!mpPayload.thumbUrl) {
            wechaty_puppet_1.log.warn(PRE, 'no thumb image found while sending mimi program');
        }
        await this._client?.sendMiniProgram(miniProgram);
    }
    // 发送文字
    async messageSendText(conversationId, text, mentionIdList) {
        let mention = '';
        if (mentionIdList && mentionIdList.length) {
            for (const item in mentionIdList) {
                const contact = await this._cacheMgr?.getContactSearch(item);
                if (contact) {
                    mention = mention + `[@,wxid=${contact.wxid},nick=${contact.name},isAuto=true]`;
                }
            }
        }
        if (mention) {
            text = mention + text;
        }
        await this._client?.sendText(conversationId, text);
    }
    // 发送h5链接
    async messageSendUrl(conversationId, urlLinkPayload) {
        const urlCard = {
            contactId: conversationId,
            content: urlLinkPayload.description,
            jumpUrl: urlLinkPayload.url,
            path: urlLinkPayload.thumbnailUrl,
            title: urlLinkPayload.title,
        };
        if (!urlLinkPayload.thumbnailUrl) {
            wechaty_puppet_1.log.warn(PRE, 'no thumb image found while sending mimi program');
        }
        await this._client?.sendShareCard(urlCard);
    }
    /**
     * 确认收款
     */
    async messageSendPost(conversationId, postPayload) {
        const msgType = postPayload.sayableList[0];
        if (msgType.type !== 'Text') {
            throw new Error('Wrong Post!!! please check your Post payload to make sure it right');
        }
        if (msgType.payload.text === 'transfer') {
            const transferid = postPayload.sayableList[1];
            if (transferid.type !== 'Text') {
                throw new Error('Wrong Post!!! please check your Post payload to make sure it right');
            }
            // 收到转账 延时 1s 进行确认
            await (0, index_js_1.delay)(1000);
            await this._sendConfirmTransfer(conversationId, transferid.payload.text);
        }
        else if (msgType.payload.text === 'music') {
            const name = postPayload.sayableList[1];
            const author = postPayload.sayableList[2];
            const app = postPayload.sayableList[3];
            const jumpUrl = postPayload.sayableList[4];
            const musicUrl = postPayload.sayableList[5];
            const imageUrl = postPayload.sayableList[6];
            if (name.type !== 'Text' || author.type !== 'Text' || app.type !== 'Text' || jumpUrl.type !== 'Text' || musicUrl.type !== 'Text' || imageUrl.type !== 'Text') {
                throw new Error('Wrong Post!!! please check your Post payload to make sure it right');
            }
            const musicPayload = {
                app: app.payload.text,
                author: author.payload.text,
                imageUrl: imageUrl.payload.text,
                jumpUrl: jumpUrl.payload.text,
                musicUrl: musicUrl.payload.text,
                name: name.payload.text,
            };
            await this._sendMusicCard(conversationId, musicPayload);
        }
    }
    /**
     * 确认收款
     * @param conversationId
     * @param transferid
     */
    async _sendConfirmTransfer(conversationId, transferid) {
        await this._client?.confirmTransfer(conversationId, transferid);
    }
    /**
     * 发送音乐卡片
     * @param conversationId
     * @param musicPayLoad
     */
    async _sendMusicCard(conversationId, musicPayLoad) {
        await this._client?.sendMusic({ contactId: conversationId, ...musicPayLoad });
    }
    /**
     * 消息撤回 暂不支持
     * @param messageId
     */
    async messageRecall(messageId) {
        return PUPPET.throwUnsupportedError(messageId);
    }
    /**
     * 消息转发
     * @param toUserName
     * @param messageId
     */
    async messageForward(toUserName, messageId) {
        const messagePayload = await this.messageRawPayload(messageId);
        const message = await this.messageRawPayloadParser(messagePayload);
        switch (message.type) {
            case PUPPET.types.Message.Text:
                await this.messageSendText(toUserName, message.text);
                break;
            case PUPPET.types.Message.Image: {
                const imageFileBox = await this.messageImage(messageId);
                await this.messageSendFile(toUserName, imageFileBox);
                break;
            }
            case PUPPET.types.Message.Audio: {
                const audioFileBox = await this.messageFile(messageId);
                await this.messageSendFile(toUserName, audioFileBox);
                break;
            }
            case PUPPET.types.Message.Video: {
                const videoFileBox = await this.messageFile(messageId);
                await this.messageSendFile(toUserName, videoFileBox);
                break;
            }
            default:
                throw new Error(`Message forwarding is unsupported for messageId:${messageId}, type:${message.type}`);
        }
    }
    /****************************************************************************
     * room
     ***************************************************************************/
    // 拉人进群
    async roomAdd(roomId, contactId) {
        let type = 1; // 1 直接拉 2 发送邀请链接  人数超过40需要对方同意
        if (roomId) {
            const ret = await this.roomRawPayload(roomId);
            if (ret && ret.memberNum && ret.memberNum > 38) {
                type = 2;
            }
        }
        await this._client?.inviteToGroup(roomId, contactId, type);
    }
    // 获取群头像
    async roomAvatar(roomId) {
        const chatroom = await this.roomRawPayload(roomId);
        if (chatroom && chatroom.avatar) {
            return file_box_1.FileBox.fromUrl(chatroom.avatar);
        }
        else {
            // return dummy FileBox object
            return file_box_1.FileBox.fromBuffer(Buffer.from(new ArrayBuffer(0)), 'room-avatar.jpg');
        }
    }
    // 创建群聊 暂不支持
    async roomCreate(contactIdList, topic) {
        return PUPPET.throwUnsupportedError(contactIdList, topic);
    }
    // 删除群聊 暂不支持
    async roomDel(roomId, contactId) {
        return PUPPET.throwUnsupportedError(roomId, contactId);
    }
    // 获取群聊列表
    async roomList() {
        return this._cacheMgr.getRoomIds();
    }
    // 获取群二维码 暂不支持
    async roomQRCode(roomId) {
        return PUPPET.throwUnsupportedError(roomId);
    }
    // 机器人退出群聊 暂不支持
    async roomQuit(roomId) {
        return PUPPET.throwUnsupportedError(roomId);
    }
    // 修改群名称
    async roomTopic(roomId, topic) {
        await this._client?.setGroupName(roomId, topic);
    }
    // 修改群公告
    async roomAnnounce(roomId, text) {
        wechaty_puppet_1.log.warn(PRE, 'roomAnnounce(%s, %s) not supported', roomId, text || '');
        if (text) {
            return;
        }
        return '';
    }
    // 获取群成员列表
    async roomMemberList(roomId) {
        const roomMemberMap = await this._getRoomMemberList(roomId);
        return Object.values(roomMemberMap).map((m) => m.wxid);
    }
    // 接受群邀请 暂不支持
    async roomInvitationAccept(roomInvitationId) {
        return PUPPET.throwUnsupportedError(roomInvitationId);
    }
    /****************************************************************************
     * RawPayload section
     ***************************************************************************/
    // 解析联系人信息格式化为Wechaty 格式
    async contactRawPayloadParser(payload) {
        return (0, contact_js_1.engineContactToWechaty)(payload);
    }
    // 获取联系人信息 原格式
    async contactRawPayload(id) {
        wechaty_puppet_1.log.silly(PRE, 'contactRawPayload(%s) @ %s', id, this);
        if (id.startsWith(SEARCH_CONTACT_PREFIX)) {
            const searchContact = await this._cacheMgr?.getContactSearch(id);
            return searchContact;
        }
        let ret = await this._cacheMgr.getContact(id);
        if (!ret) {
            ret = await (0, cached_promise_js_1.CachedPromiseFunc)(`contactRawPayload-${id}`, async () => {
                const contact = await this._refreshContact(id);
                return contact;
            });
            return ret;
        }
        return ret;
    }
    /**
     * 解析原始消息体为Wechaty支持的格式
     * @param payload
     */
    async messageRawPayloadParser(payload) {
        return (0, message_js_1.engineMessageToWechaty)(this, payload);
    }
    /**
     * 根据消息id 获取消息
     * @param id
     */
    async messageRawPayload(id) {
        const ret = await this._cacheMgr.getMessage(id);
        if (!ret) {
            throw new Error(`can not find message in cache for messageId: ${id}`);
        }
        return ret;
    }
    /**
     * 群数据格式化为Wechaty 支持类型
     * @param rawPayload
     */
    async roomRawPayloadParser(payload) {
        return (0, room_js_1.engineRoomToWechaty)(payload);
    }
    /**
     * 查找群基础信息
     * @param id
     */
    async roomRawPayload(id) {
        let ret = await this._cacheMgr.getRoom(id);
        if (!ret) {
            const contact = await this._refreshContact(id);
            ret = contact;
        }
        return ret;
    }
    /**
     * 查找群成员信息
     * @param roomId
     * @param contactId
     */
    async roomMemberRawPayload(roomId, contactId) {
        const roomMemberMap = await this._getRoomMemberList(roomId);
        return roomMemberMap[contactId];
    }
    /**
     * 解析群成员信息
     * @param rawPayload
     */
    async roomMemberRawPayloadParser(rawPayload) {
        return (0, room_js_1.engineRoomMemberToWechaty)(rawPayload);
    }
    /**
     * 接收群邀请信息  暂不支持
     * @param roomInvitationId
     */
    async roomInvitationRawPayload(roomInvitationId) {
        return PUPPET.throwUnsupportedError(roomInvitationId);
    }
    /**
     * 解析群邀请信息  暂不支持
     * @param rawPayload
     */
    async roomInvitationRawPayloadParser(rawPayload) {
        return PUPPET.throwUnsupportedError(rawPayload);
    }
    /**
     * 好友申请信息解析
     * @param rawPayload
     */
    async friendshipRawPayloadParser(rawPayload) {
        return rawPayload;
    }
    /**
     * 获取好友申请信息
     * @param id
     */
    async friendshipRawPayload(id) {
        const ret = await this._cacheMgr.getFriendshipRawPayload(id);
        if (!ret) {
            throw new Error(`Can not find friendship for id: ${id}`);
        }
        return ret;
    }
    /****************************************************************************
     * private section
     ***************************************************************************/
    // 获取群成员列表
    async _getRoomMemberList(roomId, force) {
        // FIX: https://github.com/wechaty/puppet-padlocal/issues/115
        if (!this._cacheMgr) {
            return {};
        }
        let ret = await this._cacheMgr.getRoomMember(roomId);
        if (!ret || force) {
            const resMembers = await this._client?.getGroupMembers(roomId) || [];
            const roomMemberMap = {};
            for (const roomMember of resMembers) {
                const hasContact = await this._cacheMgr.hasContact(roomMember.wxid);
                let MemberInfo;
                // save chat room member as contact, to forbid massive this._client.api.getContact(id) requests while room.ready()
                if (!hasContact) {
                    const res = await this._client?.searchContact(roomMember.wxid);
                    if (res) {
                        MemberInfo = (0, room_js_1.chatRoomMemberToContact)(res);
                        await this._cacheMgr.setContact(MemberInfo.wxid, MemberInfo);
                        roomMemberMap[roomMember.wxid] = MemberInfo;
                    }
                }
                else {
                    MemberInfo = await this._cacheMgr.getContact(roomMember.wxid);
                    roomMemberMap[roomMember.wxid] = MemberInfo;
                }
            }
            ret = roomMemberMap;
            await this._updateRoomMember(roomId, roomMemberMap);
        }
        return ret;
    }
    // 更新联系人缓存
    async _updateContactCache(contact) {
        if (!contact.wxid) {
            wechaty_puppet_1.log.warn(PRE, `wxid is required for contact: ${JSON.stringify(contact)}`);
            return;
        }
        if ((0, is_type_js_1.isRoomId)(contact.wxid)) {
            const oldRoomPayload = await this._cacheMgr.getRoom(contact.wxid);
            if (oldRoomPayload) {
                // some contact push may not contain avatar, e.g. modify room announcement
                if (!contact.avatar) {
                    contact.avatar = oldRoomPayload.avatar;
                }
                // If case you are not the chatroom owner, room leave message will not be sent.
                // Calc the room member diffs, then send room leave event instead.
                if (contact.chatroommemberList && oldRoomPayload.chatroommemberList && contact.chatroommemberList.length < oldRoomPayload.chatroommemberList.length) {
                    const newMemberIdSet = new Set(contact.chatroommemberList.map((m) => m.wxid));
                    const removedMemberIdList = oldRoomPayload.chatroommemberList
                        .filter((m) => !newMemberIdSet.has(m.wxid))
                        .map((m) => m.wxid)
                        .filter((removeeId) => !(0, event_room_leave_js_1.isRoomLeaveDebouncing)(contact.wxid, removeeId));
                    if (removedMemberIdList.length) {
                        removedMemberIdList.forEach((removeeId) => {
                            const roomLeave = {
                                removeeIdList: [removeeId],
                                removerId: removeeId,
                                roomId: contact.wxid,
                                timestamp: Math.floor(Date.now() / 1000),
                            };
                            this.emit('room-leave', roomLeave);
                        });
                    }
                }
            }
            const roomId = contact.wxid;
            await this._cacheMgr.setRoom(roomId, contact);
            await this.dirtyPayload(PUPPET.types.Payload.Room, roomId);
            await this._updateRoomMember(roomId);
        }
        else {
            await this._cacheMgr.setContact(contact.wxid, contact);
            await this.dirtyPayload(PUPPET.types.Payload.Contact, contact.wxid);
        }
    }
    // 更新群成员
    async _updateRoomMember(roomId, roomMemberMap) {
        if (roomMemberMap) {
            await this._cacheMgr.setRoomMember(roomId, roomMemberMap);
        }
        else {
            await this._cacheMgr.deleteRoomMember(roomId);
        }
        await this.dirtyPayload(PUPPET.types.Payload.RoomMember, roomId);
    }
    /**
     * 更新群成员信息
     * @param roomId
     */
    async _updateRoom(roomId) {
        if (!roomId) {
            wechaty_puppet_1.log.warn(PRE, 'roomid is required for updateRoom');
            return;
        }
        await (0, index_js_1.delay)(1000);
        const contact = await this._client?.searchContact(roomId);
        if (contact) {
            await this._onPushContact(contact);
        }
    }
    // 添加好友信息到缓存
    async _onPushContact(contact) {
        wechaty_puppet_1.log.silly(PRE, `on push contact: ${JSON.stringify(contact)}`);
        await this._updateContactCache(contact);
        if (contact.wxid) {
            const aliasToSet = await this._cacheMgr.getContactStrangerAlias(contact.wxid);
            if (aliasToSet) {
                await this.contactAlias(contact.wxid, aliasToSet);
                await this._cacheMgr.deleteContactStrangerAlias(contact.wxid);
            }
        }
    }
    async _onPushMessage(message) {
        const messageId = message.id;
        wechaty_puppet_1.log.silly(PRE, `on push original message: ${JSON.stringify(message)}`);
        if (await this._cacheMgr.hasMessage(messageId)) {
            return;
        }
        await this._cacheMgr.setMessage(message.id, message);
        const event = await (0, mod_js_1.parseEvent)(this, message);
        switch (event.type) {
            case mod_js_1.EventType.Message:
                this.emit('message', {
                    messageId,
                });
                break;
            case mod_js_1.EventType.RoomInvite: {
                const roomInvite = event.payload;
                await this._cacheMgr.setRoomInvitation(messageId, roomInvite);
                this.emit('room-invite', {
                    roomInvitationId: messageId,
                });
                break;
            }
            case mod_js_1.EventType.RoomJoin: {
                const roomJoin = event.payload;
                this.emit('room-join', roomJoin);
                await this._updateRoomMember(roomJoin.roomId);
                break;
            }
            case mod_js_1.EventType.RoomLeave: {
                const roomLeave = event.payload;
                this.emit('room-leave', roomLeave);
                await this._updateRoomMember(roomLeave.roomId);
                break;
            }
            case mod_js_1.EventType.RoomTopic: {
                const roomTopic = event.payload;
                this.emit('room-topic', roomTopic);
                break;
            }
        }
    }
    // 刷新用户信息
    async _refreshContact(wxid, isFriend) {
        const contact = await this._client?.searchContact(wxid);
        // may return contact with empty payload, empty username, nickname, etc.
        if (contact && !contact.wxid) {
            contact.wxid = wxid;
            await this._updateContactCache({ ...contact, isFriend });
            return contact;
        }
        else if (contact) {
            return contact;
        }
        return undefined;
    }
    // 开始监听心跳
    async _startPuppetHeart(firstTime = true) {
        if (firstTime && this._heartBeatTimer) {
            return;
        }
        let status = '';
        try {
            const res = await this._client?.getStats();
            if (res && res.status === 'normal') {
                status = 'normal';
                if (firstTime) {
                    res.wxid && await this.login(res.wxid);
                    wechaty_puppet_1.log.info(PRE, `login success: ${res.name}`);
                }
            }
            else if (res && res.status === 'pending') {
                status = 'pending';
                wechaty_puppet_1.log.info(PRE, 'pending, please wait confirm');
            }
            else {
                status = 'fail';
                wechaty_puppet_1.log.info(PRE, `login fail: ${res?.msg}`);
                if (!firstTime) {
                    await this.onStop();
                }
            }
        }
        catch (e) {
            status = 'unlogin';
            wechaty_puppet_1.log.info(PRE, `login fail: WeChat is not activated ${e}`);
            if (!firstTime) {
                await this.onStop();
            }
        }
        this.emit('heartbeat', { data: `heartbeat@engine:${status}` });
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this._heartBeatTimer = setTimeout(async () => {
            await this._startPuppetHeart(false);
            return undefined;
        }, 15 * 1000); // 15s
    }
    // 停止监听心跳
    _stopPuppetHeart() {
        if (!this._heartBeatTimer) {
            return;
        }
        clearTimeout(this._heartBeatTimer);
        this._heartBeatTimer = undefined;
    }
    /**
     * 解析图片
     * @param messageId
     * @param messagePayload
     * @private
     */
    async _getMessageImageFileBox(messageId, messagePayload) {
        const message = await this.messageRawPayloadParser(messagePayload);
        if (!message.text) {
            throw new Error(`Can not get file for message: ${messageId}`);
        }
        if (message.type !== PUPPET.types.Message.Image) {
            throw new Error(`message ${messageId} is not image type message`);
        }
        const reg = /\[pic=(.+),isDecrypt=(.+)]/;
        const res = message.text && reg.exec(message.text);
        const path = res?.[1];
        const isDecrypt = res?.[2];
        await (0, index_js_1.delay)(4000);
        if (this.options.runLocal && path && !fs_1.default.existsSync(path)) {
            wechaty_puppet_1.log.error(PRE, `Can not get file path: ${messageId} , isDecrypt${isDecrypt}`);
        }
        // 如果文件已经解密
        if (path && isDecrypt && isDecrypt === '1') {
            // 如果服务运行在本地 直接读取文件
            if (this.options.runLocal) {
                return file_box_1.FileBox.fromFile(path, `message-${messageId}-image.png`);
            }
            else {
                // 不在本地运行，拉取图片数据流
                const fileName = (0, index_js_1.getFileName)(path);
                const fileBox = await this._client?.getImage(fileName);
                if (fileBox) {
                    return fileBox;
                }
            }
        }
        else if (path && isDecrypt === '0') {
            if (this.options.runLocal) {
                const imageInfo = (0, image_decrypt_js_1.ImageDecrypt)(path, messageId);
                const base64 = imageInfo.base64;
                const fileName = `message-${messageId}-url.${imageInfo.extension}`;
                return file_box_1.FileBox.fromBase64(base64, fileName);
            }
        }
        throw new Error(`Can not get file path: ${messageId} , isDecrypt${isDecrypt}`);
    }
    /**
     * 解析文件
     * @param messageId
     * @param messagePayload
     * @private
     */
    async _getMessageFileFileBox(messageId, messagePayload) {
        const message = await this.messageRawPayloadParser(messagePayload);
        if (!message.text) {
            throw new Error(`Can not get file for message: ${messageId}`);
        }
        if (message.type !== PUPPET.types.Message.Attachment) {
            throw new Error(`message ${messageId} is not file type message`);
        }
        const reg = /\[file=(.+)]/;
        const res = message.text && reg.exec(message.text);
        const path = res?.[1];
        const fileName = message.filename || '';
        await (0, index_js_1.delay)(1000);
        if (this.options.runLocal && path && !fs_1.default.existsSync(path)) {
            throw new Error(`Can not get file path: ${messageId} `);
        }
        // 如果文件已经解密
        if (path) {
            // 如果服务运行在本地 直接读取文件
            if (this.options.runLocal) {
                return file_box_1.FileBox.fromFile(path, fileName);
            }
            else {
                // 不在本地运行，拉取数据流
                const file = await this._client?.getFile(fileName);
                if (file) {
                    return file_box_1.FileBox.fromBuffer(file, fileName);
                }
            }
        }
        throw new Error(`Can not get file path: ${messageId}`);
    }
}
exports.PuppetEngine = PuppetEngine;
exports.default = PuppetEngine;
//# sourceMappingURL=puppet-engine.js.map