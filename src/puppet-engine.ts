import fs from 'fs'
import path from 'path'
import { log }              from 'wechaty-puppet'
import * as PUPPET          from 'wechaty-puppet'
import type { FileBoxInterface } from 'file-box'
import { FileBox }          from 'file-box'
import type { ContactPayload, MessagePayload, MusicPayLoad } from './engine-schema.js'
import type { FileBoxMetadataMessage } from './engine/types.js'
import Client from './engine/service/request.js'
import { ImageDecrypt } from './engine/utils/image-decrypt.js'
import { delay, getFileName, putFileTransfer } from './engine/utils/index.js'
// 参考
import { CacheManager, RoomMemberMap } from './engine/cache-manager.js'
import { isIMContactId, isRoomId } from './engine/utils/is-type.js'
import { parseAppmsgMessagePayload } from './engine/messages/message-appmsg.js'
import { parseMiniProgramMessagePayload } from './engine/messages/message-miniprogram.js'
import { parseEmotionMessagePayload } from './engine/messages/message-emotion.js'
import { CachedPromiseFunc } from './engine/utils/cached-promise.js'
import { engineMessageToWechaty } from './engine/schema-mapper/message.js'
import { engineContactToWechaty } from './engine/schema-mapper/contact.js'
import {
  chatRoomMemberToContact,
  engineRoomMemberToWechaty,
  engineRoomToWechaty,
} from './engine/schema-mapper/room.js'
import { isRoomLeaveDebouncing } from './engine/events/event-room-leave.js'
import { parseEvent, EventType } from './engine/events/mod.js'
import { addRunningPuppet, removeRunningPuppet } from './cleanup.js'
import { packageJson } from './package-json.js'
import { JsonToXml } from './engine/utils/xml-to-json.js'

const VERSION = packageJson.version || '0.0.0'
const PRE = '[PuppetEngine]'
const SEARCH_CONTACT_PREFIX = '$search$-'
const STRANGER_SUFFIX = '@stranger'

export type PuppetEngineOptions = PUPPET.PuppetOptions & {
  runLocal?: boolean,
  port?: number | string | undefined,
  httpServer?: string
  engine?: any
}

class PuppetEngine extends PUPPET.Puppet {

  private _cacheMgr?: CacheManager
  private _client?: Client
  private _printVersion: boolean = true
  private _heartBeatTimer?: ReturnType<typeof setTimeout>
  public static override readonly  VERSION = VERSION

  constructor (public override options: PuppetEngineOptions = {} as PuppetEngineOptions) {
    super(options)
    if (!this.options.engine) {
      this.options.engine = Client
    }
    // 服务是不是跑在本地 默认为跑在本地
    if (this.options.runLocal === undefined) {
      this.options.runLocal = true
    }

    if (!this.options.port) {
      const port = process.env['WECHATY_PUPPET_ENGINE_PORT'] || '8089'
      if (port) {
        this.options.port = port
      }
    }
    if (!this.options.httpServer) {
      const httpServer = process.env['WECHATY_PUPPET_ENGINE_HTTPSERVER'] || 'http://127.0.0.1:8055'
      if (httpServer) {
        this.options.httpServer = httpServer
      }
    }
  }

  public get client () {
    return this._client
  }

  override async onStart (): Promise<void> {
    log.verbose(PRE, 'onStart()')
    await this._startClient()
  }

  /**
   * 启动监听
   * @private
   */
  private async _startClient () {
    this._client = await this.options.engine.create(this.options)
    await this._startPuppetHeart(true)
    if (this._client) {
      this._client.on('hook', () => {
        log.info(PRE, 'hook success')
      })
      this._client.on('login', this.wrapAsync(async ({ wxid, name, robotInfo }) => {
        log.info(PRE, `login success: ${name}`)
        await this._cacheMgr!.setContact(wxid, robotInfo)
        await this.login(wxid)
      }))
      this._client.on('message', this.wrapAsync(async (message:MessagePayload) => {
        await this._onPushMessage(message)
      }))
      this._client.on('contact', this.wrapAsync(async (friendShip:PUPPET.payloads.FriendshipReceive) => {
        await this._friendRequestEvent(friendShip)
      }))
    }
    addRunningPuppet(this)
    if (this._printVersion) {
      // only print once
      this._printVersion = false
      log.info(`
      ============================================================
       Welcome to Wechaty Engine puppet!

       - puppet-Engine version: ${VERSION}
      ============================================================
    `)
    }
  }

  // 好友请求事件监听
  private async _friendRequestEvent (Message: PUPPET.payloads.FriendshipReceive) {
    await this._cacheMgr!.setFriendshipRawPayload(Message.contactId, Message)
    this.emit('friendship', {
      friendshipId: Message.contactId,
    })
  }

  // 登录
  override async login (userId: string):Promise<void> {
    try {
      // create cache manager firstly
      if (!this._client) {
        this._client = await this.options.engine.create(this.options)
      }
      this._cacheMgr = new CacheManager(userId)
      await this._cacheMgr.init()
      await super.login(userId)

      const oldContact = await this._cacheMgr.getContact(this.currentUserId!)
      if (!oldContact && this._client) {
        // 获取机器人信息
        const selfContact = await this._client.getSelfInfo()
        await this._updateContactCache(selfContact)
      }
      await this.ready()
    } catch (e) {
      log.error('error login', e)
    }
  }

  public async ready (): Promise<void> {
    try {
      const contactList: ContactPayload[] = await this._client?.getContactList('2') || []
      for (const contact of contactList) {
        await this._onPushContact(contact)
      }
      const roomList: ContactPayload[] = await this._client?.getGroupList('2') || []
      for (const contact of roomList) {
        await this._onPushContact(contact)
      }
      const officeList: ContactPayload[] = await this._client?.getOfficeList('2') || []
      for (const contact of officeList) {
        await this._onPushContact(contact)
      }
      log.silly(PRE, 'on ready')
      setTimeout(() => {
        this._client?.setDownloadImg(1).then(() => {
          log.info('set download all day')
          return ''
        }).catch(e => {
          log.error('set download all day', e)
        })
      }, 3000)
      setTimeout(() => {
        this.emit('ready', {
          data: 'ready',
        })
      }, 10000)
    } catch (e) {
      log.error('ready error', e)
    }
  }

  public async onStop (): Promise<void> {
    await this._stopClient()
  }

  private async _stopClient (): Promise<void> {
    this.__currentUserId = undefined
    this.__currentUserId = undefined
    if (this._cacheMgr) {
      log.info(PRE, 'colse cache')
      await this._cacheMgr.close()
      this._cacheMgr = undefined
    }
    removeRunningPuppet(this)
    this._stopPuppetHeart()
  }

  // 登出
  override async logout (): Promise<void> {
    if (!this.isLoggedIn) {
      return
    }
    this.emit('logout', { contactId: this.currentUserId, data: 'logout by self' })
    await this._stopClient()
  }

  override ding (data?: string): void {
    const eventDongPayload = {
      data: data ? data! : 'ding-dong',
    }
    this.emit('dong', eventDongPayload)
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
  override async contactSelfName (name: string): Promise<void> {
    return PUPPET.throwUnsupportedError(name)
  }

  // 获取自己的二维码 暂不支持
  override async contactSelfQRCode (): Promise<string> {
    return PUPPET.throwUnsupportedError()
  }

  // 设置自己的签名 暂不支持
  override async contactSelfSignature (signature: string): Promise<void> {
    return PUPPET.throwUnsupportedError(signature)
  }

  // 获取用户的手机号 暂不支持
  override async contactPhone (contactId: string, phoneList: string[]): Promise<void> {
    return PUPPET.throwUnsupportedError(contactId, phoneList)
  }

  // 查询或设置用户备注
  override contactAlias (contactId: string)                      : Promise<string>
  override contactAlias (contactId: string, alias: string | null): Promise<void>

  override async contactAlias (contactId : string, alias?    : string | null): Promise<string | void> {
    const contact = await this.contactRawPayload(contactId)
    if (alias) {
      // contact is stranger, set alias in cache, to update after user is added
      if (contact) {
        if (contact.wxid.indexOf(STRANGER_SUFFIX) !== -1) {
          await this._cacheMgr!.setContactStrangerAlias(contact.wxid, alias)

          // to suppress warning: 15:31:06 WARN Contact alias(asd3) sync with server fail: set(asd3) is not equal to get()
          if (contactId.startsWith(SEARCH_CONTACT_PREFIX)) {
            const searchContact = await this._cacheMgr?.getContactSearch(contactId)
            if (searchContact) {
              searchContact.remark = alias
              await this._cacheMgr!.setContactSearch(contactId, searchContact)
            }
          }
        } else {
          await this._client?.setContactAlias(contactId, alias)
          contact.remark = alias
          await this._updateContactCache(contact)
        }
      }
    } else {
      return contact && contact.remark
    }
  }

  // 获取用户头像
  override async contactAvatar (contactId: string)                          : Promise<FileBoxInterface>
  override async contactAvatar (contactId: string, file: FileBoxInterface)  : Promise<void>

  override async contactAvatar (contactId: string, file?: FileBoxInterface) : Promise<void | FileBoxInterface> {
    if (file) {
      return PUPPET.throwUnsupportedError('set avatar is not unsupported')
    }
    const contact = await this.contactRawPayload(contactId)
    if (contact && contact.avatar) {
      return FileBox.fromUrl(contact.avatar, { name: `avatar-${contactId}.jpg` })
    }
  }

  // 获取用户列表
  override async contactList (): Promise<string[]> {
    return this._cacheMgr!.getContactIds()
  }

  // 公司备注 暂不支持
  override async contactCorporationRemark (contactId: string, corporationRemark: string | null) {
    return PUPPET.throwUnsupportedError(contactId, corporationRemark)
  }

  // 其他备注 暂不支持
  override async contactDescription (contactId: string, description: string | null) {
    return PUPPET.throwUnsupportedError(contactId, description)
  }

  // 删除联系人
  public async contactDelete (contactId: string): Promise<void> {
    const contact = await this._refreshContact(contactId)
    if (contact && contact.isFriend === 2) {
      log.warn(`can not delete contact which is not a friend:: ${contactId}`)
      return
    }
    await this._client?.removeContact(contactId)
    await this._refreshContact(contactId, 2)
  }

  // 添加标签 暂不支持
  override async tagContactAdd (tagId: string, contactId: string): Promise<void> {
    return PUPPET.throwUnsupportedError(tagId, contactId)
  }

  // 删除用户标签 暂不支持
  override async tagContactRemove (tagId: string, contactId: string): Promise<void> {
    return PUPPET.throwUnsupportedError(tagId, contactId)
  }

  // 删除标签
  override async tagContactDelete (tagId: string) : Promise<void> {
    return PUPPET.throwUnsupportedError(tagId)
  }

  // 获取用户标签
  override async tagContactList (contactId?: string) : Promise<string[]> {
    return PUPPET.throwUnsupportedError(contactId)
  }

  /****************************************************************************
   * friendship
   ***************************************************************************/
  /**
   * 通过好友请求
   * @param friendshipId
   */
  override async friendshipAccept (friendshipId : string): Promise<void> {
    const friendship: PUPPET.payloads.FriendshipReceive = (await this.friendshipRawPayload(
      friendshipId,
    )) as PUPPET.payloads.FriendshipReceive
    const userName = friendship.contactId

    // FIXME: workaround to make accept enterprise account work. can be done in a better way
    if (isIMContactId(userName)) {
      await this._refreshContact(userName)
    }
    await this._client?.confirmFriendship(friendship.scene, friendship.ticket.split('-')[0], friendship.ticket.split('-')[1])
  }

  /**
   * 主动添加好友
   * @param contactId
   * @param option
   */
  override async friendshipAdd (contactId: string, option?: PUPPET.types.FriendshipAddOptions): Promise<void> {
    let stranger: number | undefined
    let ticket: string
    let addContactScene
    let addType: string
    const cachedContactSearch = await this._cacheMgr!.getContactSearch(contactId)
    // 通过陌生人查找用户 手机或者qq
    if (cachedContactSearch) {
      stranger = cachedContactSearch.isFriend || undefined
      ticket = cachedContactSearch.ticket || ''
      addContactScene = cachedContactSearch.scene
      addType = 'v3'
    } else {
      // 通过wxid 查找
      const contactPayload = await this.contactRawPayload(contactId)
      const contactAlias = contactPayload?.remark
      if (!contactAlias) {
        // add contact from room,
        const roomIds = await this._findRoomIdForWxid(contactId)
        if (!roomIds.length) {
          throw new Error(`Can not find room for contact while adding friendship: ${contactId}`)
        }
        const res = await this._client?.searchContact(contactId)
        if (res) {
          await this._updateContactCache(res)
        }
        addContactScene = '14' // 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
      }
      const res = await this.contactRawPayload(contactId)
      if (res?.isFriend === 1) {
        throw new Error(`contact:${contactId} is already a friend`)
      }
      // 通过wxid加好友
      ticket = ''
      addContactScene = '6' // 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
      addType = 'wxid'
    }
    let hello: string | undefined
    if (stranger === 1) {
      throw new Error(`contact:${contactId} is already a friend`)
    }
    if (option) {
      if (typeof option === 'string') {
        hello = option
      } else {
        hello = (option as any).hello
      }
    }
    if (addType === 'v3') {
      await this._client?.addFriendByV3({ content: hello, scene: addContactScene, type: 1, v3: ticket.split('-')[0] })
    } else if (addType === 'wxid') {
      await this._client?.addFriendByWxid({ content: hello, scene: addContactScene, wxid: contactId })
    }
  }

  /**
   * 根据手机号查询好友
   * @param phone
   */
  override async friendshipSearchPhone (phone: string): Promise<null | string> {
    return this._friendshipSearch(phone, '15')
  }

  /**
   * 根据qq号查询好友
   * @param qq
   */
  override async friendshipSearchHandle (qq: string): Promise<null | string> {
    return this._friendshipSearch(qq, '1')
  }

  /**
   * 陌生人查询
   * @param id
   * @param scene 场景值 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
   * @private
   */
  private async _friendshipSearch (id: string, scene?:string): Promise<null | string> {
    const cachedContactSearch = await this._cacheMgr!.getContactSearch(id)
    if (cachedContactSearch) {
      return id
    }

    const res = await this._client?.searchStranger(id)
    const searchId = `${SEARCH_CONTACT_PREFIX}${id}`
    if (res) {
      await this._cacheMgr!.setContactSearch(searchId, { ...res, scene })
    }
    return searchId
  }

  /**
   * 根据wxid 查询群id
   * @param wxid
   * @private
   */
  private async _findRoomIdForWxid (wxid: string): Promise<string[]> {
    const ret = []

    const roomIds = (await this._cacheMgr?.getRoomIds()) || []
    for (const roomId of roomIds) {
      const roomMember = await this._cacheMgr?.getRoomMember(roomId)
      if (!roomMember) {
        continue
      }

      const roomMemberIds = Object.keys(roomMember)
      if (roomMemberIds.indexOf(wxid) !== -1) {
        ret.push(roomId)
      }
    }

    return ret
  }

  /****************************************************************************
   * get message payload
   ***************************************************************************/
  // 名片
  override async messageContact (messageId: string): Promise<string> {
    log.verbose('PuppetWeChat', 'messageContact(%s)', messageId)
    return PUPPET.throwUnsupportedError(messageId)
  }

  // 文件消息
  override async messageFile (messageId: string): Promise<FileBoxInterface> {
    const messagePayload: MessagePayload = await this.messageRawPayload(messageId)
    const message: PUPPET.payloads.Message = await this.messageRawPayloadParser(messagePayload)
    switch (message.type) {
      // 图片
      case PUPPET.types.Message.Image:
        return this._getMessageImageFileBox(messageId, messagePayload)
      case PUPPET.types.Message.Audio:
        return PUPPET.throwUnsupportedError(messageId)
      case PUPPET.types.Message.Video: {
        return PUPPET.throwUnsupportedError(messageId)
      }
      case PUPPET.types.Message.Attachment:
        if (message.text && message.text.includes('[file=')) {
          return this._getMessageFileFileBox(messageId, messagePayload)
        }
        return PUPPET.throwUnsupportedError(messageId)
      case PUPPET.types.Message.Emoticon: {
        const emotionPayload = await parseEmotionMessagePayload(messagePayload)
        const emoticonBox = FileBox.fromUrl(emotionPayload.cdnurl, { name: `message-${messageId}-emoticon.jpg` })

        emoticonBox.metadata = {
          payload: emotionPayload,
          type: 'emoticon',
        }

        return emoticonBox
      }
      case PUPPET.types.Message.MiniProgram:
        return PUPPET.throwUnsupportedError(messageId)
      case PUPPET.types.Message.Url:
        return PUPPET.throwUnsupportedError(messageId)
      default:
        throw new Error(`Can not get file for message: ${messageId}`)
    }
  }

  /**
   * 解析图片消息
   * @param messageId
   */
  override async messageImage (messageId: string): Promise<FileBoxInterface> {
    const messagePayload: MessagePayload = await this.messageRawPayload(messageId)
    return this._getMessageImageFileBox(messageId, messagePayload)
  }

  /**
   * 解析小程序
   * @param messageId
   */
  override async messageMiniProgram (messageId: string): Promise<PUPPET.payloads.MiniProgram> {
    const messagePayload = await this.messageRawPayload(messageId)
    const message = await this.messageRawPayloadParser(messagePayload)

    if (message.type !== PUPPET.types.Message.MiniProgram) {
      throw new Error('message is not mini program, can not get MiniProgramPayload')
    }

    return parseMiniProgramMessagePayload(messagePayload)
  }

  /**
   * 解析h5链接
   * @param messageId
   */
  override async messageUrl (messageId: string)  : Promise<PUPPET.payloads.UrlLink> {
    const rawPayload = await this.messageRawPayload(messageId)
    const payload = await this.messageRawPayloadParser(rawPayload)

    if (payload.type !== PUPPET.types.Message.Url) {
      throw new Error('Can not get url from non url payload')
    }

    // FIXME: thumb may not in appPayload.thumburl, but in appPayload.appAttachPayload
    const appPayload = await parseAppmsgMessagePayload(rawPayload.msg)
    return {
      description: appPayload.des,
      thumbnailUrl: appPayload.thumburl,
      title: appPayload.title,
      url: appPayload.url,
    }
  }

  /****************************************************************************
   * send message
   ***************************************************************************/
  // 发送名片
  override async messageSendContact (toUserId: string, contactId: string): Promise<void> {
    log.verbose('PuppetWeChat', 'messageSend("%s", %s)', toUserId, contactId)
    const contactPayload = await this.contactRawPayload(contactId)
    const xmlObj = {
      msg: {
        antispamticket: '', // TODO 需要考虑怎么设置
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
    }
    const xml = JsonToXml(xmlObj)
    await this._client?.sendContactCard(toUserId, xml)
  }

  // 发送文件
  override async messageSendFile (conversationId: string, fileBox: FileBoxInterface): Promise<void> {
    const metadata: FileBoxMetadataMessage = fileBox.metadata as FileBoxMetadataMessage
    if (metadata.type === 'emoticon') {
      PUPPET.throwUnsupportedError(conversationId, fileBox)
    } else if (fileBox.mediaType.startsWith('image/')) {
      if (this.options.runLocal) {
        const filePath = path.resolve(fileBox.name)
        log.verbose('filePath===============', filePath)
        await fileBox.toFile(filePath, true)
        await this._client?.sendLocalImg(conversationId, filePath)
        fs.unlinkSync(filePath)
      } else {
        const buffer = await fileBox.toBuffer()
        const cdnUrl = await putFileTransfer(fileBox.name, buffer)
        await this._client?.sendLocalImg(conversationId, cdnUrl)
      }
    } else if (fileBox.mediaType === 'audio/silk') {
      PUPPET.throwUnsupportedError(conversationId, fileBox)
    } else {
      if (this.options.runLocal) {
        const filePath = path.resolve(fileBox.name)
        log.verbose('filePath===============', filePath)
        await fileBox.toFile(filePath, true)
        await this._client?.sendLocalFile(conversationId, filePath)
        fs.unlinkSync(filePath)
      } else {
        const buffer = await fileBox.toBuffer()
        const cdnUrl = await putFileTransfer(fileBox.name, buffer)
        await this._client?.sendLocalFile(conversationId, cdnUrl)
      }
    }
  }

  // 发送小程序
  override async messageSendMiniProgram (toUserName: string, mpPayload: PUPPET.payloads.MiniProgram): Promise<void> {
    const miniProgram = {
      contactId: toUserName,
      content: mpPayload.description,
      gh: mpPayload.username,
      jumpUrl: mpPayload.pagePath,
      path: mpPayload.thumbUrl,
      title: mpPayload.title,
    }

    if (!mpPayload.thumbUrl) {
      log.warn(PRE, 'no thumb image found while sending mimi program')
    }

    await this._client?.sendMiniProgram(miniProgram)
  }

  // 发送文字
  override async messageSendText (conversationId: string, text: string, mentionIdList?: string[]): Promise<string | void> {
    let mention = ''
    if (mentionIdList && mentionIdList.length) {
      for (const item in mentionIdList) {
        const contact = await this._cacheMgr?.getContactSearch(item)
        if (contact) {
          mention = mention + `[@,wxid=${contact.wxid},nick=${contact.name},isAuto=true]`
        }
      }
    }
    if (mention) {
      text = mention + text
    }
    await this._client?.sendText(conversationId, text)
  }

  // 发送h5链接
  override async messageSendUrl (conversationId: string, urlLinkPayload: PUPPET.payloads.UrlLink): Promise<string | void> {
    const urlCard = {
      contactId: conversationId,
      content: urlLinkPayload.description,
      jumpUrl: urlLinkPayload.url,
      path: urlLinkPayload.thumbnailUrl,
      title: urlLinkPayload.title,
    }
    if (!urlLinkPayload.thumbnailUrl) {
      log.warn(PRE, 'no thumb image found while sending mimi program')
    }
    await this._client?.sendShareCard(urlCard)
  }

  /**
   * 确认收款
   */
  override async messageSendPost (conversationId: string, postPayload: PUPPET.payloads.Post): Promise<void> {
    const msgType = postPayload.sayableList[0] as PUPPET.payloads.Sayable
    if (msgType.type !== 'Text') {
      throw new Error('Wrong Post!!! please check your Post payload to make sure it right')
    }
    if (msgType.payload.text === 'transfer') {
      const transferid = postPayload.sayableList[1] as PUPPET.payloads.Sayable
      if (transferid.type !== 'Text') {
        throw new Error('Wrong Post!!! please check your Post payload to make sure it right')
      }
      // 收到转账 延时 1s 进行确认
      await delay(1000)
      await this._sendConfirmTransfer(conversationId, transferid.payload.text)
    } else if (msgType.payload.text === 'music') {
      const name = postPayload.sayableList[1] as PUPPET.payloads.Sayable
      const author = postPayload.sayableList[2] as PUPPET.payloads.Sayable
      const app = postPayload.sayableList[3] as PUPPET.payloads.Sayable
      const jumpUrl = postPayload.sayableList[4] as PUPPET.payloads.Sayable
      const musicUrl = postPayload.sayableList[5] as PUPPET.payloads.Sayable
      const imageUrl = postPayload.sayableList[6] as PUPPET.payloads.Sayable
      if (name.type !== 'Text' || author.type !== 'Text' || app.type !== 'Text' || jumpUrl.type !== 'Text' || musicUrl.type !== 'Text' || imageUrl.type !== 'Text') {
        throw new Error('Wrong Post!!! please check your Post payload to make sure it right')
      }
      const musicPayload = {
        app: app.payload.text, // 酷狗/wx79f2c4418704b4f8，网易云/wx8dd6ecd81906fd84，QQ音乐/wx5aa333606550dfd5
        author: author.payload.text,
        imageUrl: imageUrl.payload.text, // 网络图片直链
        jumpUrl: jumpUrl.payload.text, // 点击后跳转地址
        musicUrl: musicUrl.payload.text, // 网络歌曲直链
        name: name.payload.text,
      }
      await this._sendMusicCard(conversationId, musicPayload)
    }
  }

  /**
   * 确认收款
   * @param conversationId
   * @param transferid
   */
  public async _sendConfirmTransfer (conversationId: string, transferid: string): Promise<void> {
    await this._client?.confirmTransfer(conversationId, transferid)
  }

  /**
   * 发送音乐卡片
   * @param conversationId
   * @param musicPayLoad
   */
  public async _sendMusicCard (conversationId: string, musicPayLoad:MusicPayLoad): Promise<void> {
    await this._client?.sendMusic({ contactId: conversationId, ...musicPayLoad })
  }

  /**
   * 消息撤回 暂不支持
   * @param messageId
   */
  override async messageRecall (messageId: string): Promise<boolean> {
    return PUPPET.throwUnsupportedError(messageId)
  }

  /**
   * 消息转发
   * @param toUserName
   * @param messageId
   */
  override async messageForward (toUserName: string, messageId: string): Promise<void> {
    const messagePayload = await this.messageRawPayload(messageId)
    const message = await this.messageRawPayloadParser(messagePayload)

    switch (message.type) {
      case PUPPET.types.Message.Text:
        await this.messageSendText(toUserName, message.text!)
        break

      case PUPPET.types.Message.Image: {
        const imageFileBox = await this.messageImage(messageId)
        await this.messageSendFile(toUserName, imageFileBox)
        break
      }
      case PUPPET.types.Message.Audio: {
        const audioFileBox = await this.messageFile(messageId)
        await this.messageSendFile(toUserName, audioFileBox)
        break
      }
      case PUPPET.types.Message.Video: {
        const videoFileBox = await this.messageFile(messageId)
        await this.messageSendFile(toUserName, videoFileBox)
        break
      }
      default:
        throw new Error(`Message forwarding is unsupported for messageId:${messageId}, type:${message.type}`)
    }
  }
  /****************************************************************************
   * room
   ***************************************************************************/

  // 拉人进群
  override async roomAdd (roomId    : string, contactId : string): Promise<void> {
    let type:number = 1 // 1 直接拉 2 发送邀请链接  人数超过40需要对方同意
    if (roomId) {
      const ret = await this.roomRawPayload(roomId)
      if (ret && ret.memberNum && ret.memberNum > 38) {
        type = 2
      }
    }
    await this._client?.inviteToGroup(roomId, contactId, type)
  }

  // 获取群头像
  override async roomAvatar (roomId: string): Promise<FileBoxInterface> {
    const chatroom = await this.roomRawPayload(roomId)
    if (chatroom && chatroom.avatar) {
      return FileBox.fromUrl(chatroom.avatar)
    } else {
      // return dummy FileBox object
      return FileBox.fromBuffer(Buffer.from(new ArrayBuffer(0)), 'room-avatar.jpg')
    }
  }

  // 创建群聊 暂不支持
  override async roomCreate (
    contactIdList : string[],
    topic         : string,
  ): Promise<string> {
    return PUPPET.throwUnsupportedError(contactIdList, topic)
  }

  // 删除群聊 暂不支持
  override async roomDel (
    roomId    : string,
    contactId : string,
  ): Promise<void> {
    return PUPPET.throwUnsupportedError(roomId, contactId)
  }

  // 获取群聊列表
  override async roomList (): Promise<string[]> {
    return this._cacheMgr!.getRoomIds()
  }

  // 获取群二维码 暂不支持
  override async roomQRCode (roomId: string): Promise<string> {
    return PUPPET.throwUnsupportedError(roomId)
  }

  // 机器人退出群聊 暂不支持
  override async roomQuit (roomId: string): Promise<void> {
    return PUPPET.throwUnsupportedError(roomId)
  }

  override async roomTopic (roomId: string)                : Promise<string>
  override async roomTopic (roomId: string, topic: string) : Promise<void>

  // 修改群名称
  override async roomTopic (
    roomId : string,
    topic? : string,
  ): Promise<void | string> {
    await this._client?.setGroupName(roomId, topic)
  }

  override async roomAnnounce (roomId: string)                : Promise<string>
  override async roomAnnounce (roomId: string, text: string)  : Promise<void>

  // 修改群公告
  override async roomAnnounce (roomId: string, text?: string) : Promise<void | string> {
    log.warn(PRE, 'roomAnnounce(%s, %s) not supported', roomId, text || '')

    if (text) {
      return
    }
    return ''
  }

  // 获取群成员列表
  override async roomMemberList (roomId: string) : Promise<string[]> {
    const roomMemberMap = await this._getRoomMemberList(roomId)
    return Object.values(roomMemberMap).map((m) => m.wxid)
  }

  // 接受群邀请 暂不支持
  override async roomInvitationAccept (roomInvitationId: string): Promise<void> {
    return PUPPET.throwUnsupportedError(roomInvitationId)
  }

  /****************************************************************************
   * RawPayload section
   ***************************************************************************/

  // 解析联系人信息格式化为Wechaty 格式
  override async contactRawPayloadParser (payload: ContactPayload): Promise<PUPPET.payloads.Contact> {
    return engineContactToWechaty(payload)
  }

  // 获取联系人信息 原格式
  override async contactRawPayload (id: string): Promise<ContactPayload | undefined> {
    log.silly(PRE, 'contactRawPayload(%s) @ %s', id, this)
    if (id.startsWith(SEARCH_CONTACT_PREFIX)) {
      const searchContact = await this._cacheMgr?.getContactSearch(id)
      return searchContact
    }

    let ret = await this._cacheMgr!.getContact(id)
    if (!ret) {
      ret = await CachedPromiseFunc(`contactRawPayload-${id}`, async () => {
        const contact = await this._refreshContact(id)
        return contact
      })
      return ret
    }
    return ret
  }

  /**
   * 解析原始消息体为Wechaty支持的格式
   * @param payload
   */
  override async messageRawPayloadParser (payload: MessagePayload): Promise<PUPPET.payloads.Message> {
    return engineMessageToWechaty(this, payload)
  }

  /**
   * 根据消息id 获取消息
   * @param id
   */
  override async messageRawPayload (id: string): Promise<MessagePayload> {
    const ret = await this._cacheMgr!.getMessage(id)
    if (!ret) {
      throw new Error(`can not find message in cache for messageId: ${id}`)
    }

    return ret
  }

  /**
   * 群数据格式化为Wechaty 支持类型
   * @param rawPayload
   */
  override async roomRawPayloadParser (payload: ContactPayload): Promise<PUPPET.payloads.Room> {
    return engineRoomToWechaty(payload)
  }

  /**
   * 查找群基础信息
   * @param id
   */
  override async roomRawPayload (id: string): Promise<ContactPayload|undefined> {
    let ret = await this._cacheMgr!.getRoom(id)
    if (!ret) {
      const contact = await this._refreshContact(id)
      ret = contact
    }
    return ret
  }

  /**
   * 查找群成员信息
   * @param roomId
   * @param contactId
   */
  override async roomMemberRawPayload (roomId: string, contactId: string): Promise<ContactPayload>  {
    const roomMemberMap = await this._getRoomMemberList(roomId)
    return roomMemberMap[contactId]!
  }

  /**
   * 解析群成员信息
   * @param rawPayload
   */
  override async roomMemberRawPayloadParser (rawPayload: ContactPayload): Promise<PUPPET.payloads.RoomMember>  {
    return engineRoomMemberToWechaty(rawPayload)
  }

  /**
   * 接收群邀请信息  暂不支持
   * @param roomInvitationId
   */
  override async roomInvitationRawPayload (roomInvitationId: string): Promise<any> {
    return PUPPET.throwUnsupportedError(roomInvitationId)
  }

  /**
   * 解析群邀请信息  暂不支持
   * @param rawPayload
   */
  override async roomInvitationRawPayloadParser (rawPayload: any): Promise<PUPPET.payloads.RoomInvitation> {
    return PUPPET.throwUnsupportedError(rawPayload)
  }

  /**
   * 好友申请信息解析
   * @param rawPayload
   */
  override async friendshipRawPayloadParser (rawPayload: PUPPET.payloads.Friendship): Promise<PUPPET.payloads.Friendship> {
    return rawPayload
  }

  /**
   * 获取好友申请信息
   * @param id
   */
  override async friendshipRawPayload (id: string): Promise<PUPPET.payloads.FriendshipReceive> {
    const ret = await this._cacheMgr!.getFriendshipRawPayload(id)

    if (!ret) {
      throw new Error(`Can not find friendship for id: ${id}`)
    }

    return ret
  }

  /****************************************************************************
   * private section
   ***************************************************************************/

  // 获取群成员列表
  private async _getRoomMemberList (roomId: string, force?: boolean): Promise<RoomMemberMap> {
    // FIX: https://github.com/wechaty/puppet-padlocal/issues/115
    if (!this._cacheMgr) {
      return {}
    }

    let ret = await this._cacheMgr!.getRoomMember(roomId)
    if (!ret || force) {
      const resMembers = await this._client?.getGroupMembers(roomId) || []

      const roomMemberMap: RoomMemberMap = {}
      for (const roomMember of resMembers) {
        const hasContact = await this._cacheMgr!.hasContact(roomMember.wxid)
        let MemberInfo: ContactPayload
        // save chat room member as contact, to forbid massive this._client.api.getContact(id) requests while room.ready()
        if (!hasContact) {
          const res = await this._client?.searchContact(roomMember.wxid)
          if (res) {
            MemberInfo = chatRoomMemberToContact(res)
            await this._cacheMgr!.setContact(MemberInfo.wxid, MemberInfo)
            roomMemberMap[roomMember.wxid] = MemberInfo
          }
        } else {
          MemberInfo = await this._cacheMgr!.getContact(roomMember.wxid) as ContactPayload
          roomMemberMap[roomMember.wxid] = MemberInfo
        }
      }
      ret = roomMemberMap
      await this._updateRoomMember(roomId, roomMemberMap)
    }

    return ret
  }

  // 更新联系人缓存
  private async _updateContactCache (contact: ContactPayload): Promise<void> {
    if (!contact.wxid) {
      log.warn(PRE, `wxid is required for contact: ${JSON.stringify(contact)}`)
      return
    }

    if (isRoomId(contact.wxid)) {
      const oldRoomPayload = await this._cacheMgr!.getRoom(contact.wxid)
      if (oldRoomPayload) {
        // some contact push may not contain avatar, e.g. modify room announcement
        if (!contact.avatar) {
          contact.avatar = oldRoomPayload.avatar
        }

        // If case you are not the chatroom owner, room leave message will not be sent.
        // Calc the room member diffs, then send room leave event instead.
        if (contact.chatroommemberList && oldRoomPayload.chatroommemberList && contact.chatroommemberList.length < oldRoomPayload.chatroommemberList.length) {
          const newMemberIdSet = new Set(contact.chatroommemberList.map((m) => m.wxid))
          const removedMemberIdList = oldRoomPayload.chatroommemberList
            .filter((m) => !newMemberIdSet.has(m.wxid))
            .map((m) => m.wxid)
            .filter((removeeId) => !isRoomLeaveDebouncing(contact.wxid, removeeId))

          if (removedMemberIdList.length) {
            removedMemberIdList.forEach((removeeId) => {
              const roomLeave: PUPPET.payloads.EventRoomLeave = {
                removeeIdList: [ removeeId ],
                removerId: removeeId,
                roomId: contact.wxid,
                timestamp: Math.floor(Date.now() / 1000),
              }
              this.emit('room-leave', roomLeave)
            })
          }
        }
      }

      const roomId = contact.wxid
      await this._cacheMgr!.setRoom(roomId, contact)
      await this.dirtyPayload(PUPPET.types.Payload.Room, roomId)

      await this._updateRoomMember(roomId)
    } else {
      await this._cacheMgr!.setContact(contact.wxid, contact)
      await this.dirtyPayload(PUPPET.types.Payload.Contact, contact.wxid)
    }
  }

  // 更新群成员
  private async _updateRoomMember (roomId: string, roomMemberMap?: RoomMemberMap) {
    if (roomMemberMap) {
      await this._cacheMgr!.setRoomMember(roomId, roomMemberMap)
    } else {
      await this._cacheMgr!.deleteRoomMember(roomId)
    }

    await this.dirtyPayload(PUPPET.types.Payload.RoomMember, roomId)
  }

  /**
   * 更新群成员信息
   * @param roomId
   */
  public async _updateRoom (roomId:string) {
    if (!roomId) {
      log.warn(PRE, 'roomid is required for updateRoom')
      return
    }
    await delay(1000)
    const contact: ContactPayload | undefined = await this._client?.searchContact(roomId)
    if (contact) {
      await this._onPushContact(contact)
    }
  }

  // 添加好友信息到缓存
  private async _onPushContact (contact: ContactPayload): Promise<void> {
    log.silly(PRE, `on push contact: ${JSON.stringify(contact)}`)

    await this._updateContactCache(contact)

    if (contact.wxid) {
      const aliasToSet = await this._cacheMgr!.getContactStrangerAlias(contact.wxid)
      if (aliasToSet) {
        await this.contactAlias(contact.wxid, aliasToSet)
        await this._cacheMgr!.deleteContactStrangerAlias(contact.wxid)
      }
    }
  }

  private async _onPushMessage (message: MessagePayload): Promise<void> {
    const messageId = message.id
    log.silly(PRE, `on push original message: ${JSON.stringify(message)}`)
    if (await this._cacheMgr!.hasMessage(messageId)) {
      return
    }
    await this._cacheMgr!.setMessage(message.id, message)
    const event = await parseEvent(this, message)
    switch (event.type) {
      case EventType.Message:
        this.emit('message', {
          messageId,
        })
        break
      case EventType.RoomInvite: {
        const roomInvite: PUPPET.payloads.RoomInvitation = event.payload
        await this._cacheMgr!.setRoomInvitation(messageId, roomInvite)

        this.emit('room-invite', {
          roomInvitationId: messageId,
        })
        break
      }
      case EventType.RoomJoin: {
        const roomJoin: PUPPET.payloads.EventRoomJoin = event.payload
        this.emit('room-join', roomJoin)
        await this._updateRoomMember(roomJoin.roomId)
        break
      }
      case EventType.RoomLeave: {
        const roomLeave: PUPPET.payloads.EventRoomLeave = event.payload
        this.emit('room-leave', roomLeave)

        await this._updateRoomMember(roomLeave.roomId)
        break
      }
      case EventType.RoomTopic: {
        const roomTopic: PUPPET.payloads.EventRoomTopic = event.payload
        this.emit('room-topic', roomTopic)
        break
      }
    }
  }

  // 刷新用户信息
  private async _refreshContact (wxid: string, isFriend?: number): Promise<ContactPayload | undefined> {
    const contact = await this._client?.searchContact(wxid)
    // may return contact with empty payload, empty username, nickname, etc.
    if (contact && !contact.wxid) {
      contact.wxid = wxid
      await this._updateContactCache({ ...contact, isFriend })
      return contact
    } else if (contact) {
      return contact
    }
    return undefined
  }

  // 开始监听心跳
  private async _startPuppetHeart (firstTime: boolean = true) {
    if (firstTime && this._heartBeatTimer) {
      return
    }
    let status: string|undefined = ''
    try {
      const res = await this._client?.getStats()
      if (res && res.status === 'normal') {
        status = 'normal'
        if (firstTime) {
          res.wxid && await this.login(res.wxid)
          log.info(PRE, `login success: ${res.name}`)
        }
      } else if (res && res.status === 'pending') {
        status = 'pending'
        log.info(PRE, 'pending, please wait confirm')
      } else {
        status = 'fail'
        log.info(PRE, `login fail: ${res?.msg}`)
        if (!firstTime) {
          await this.onStop()
        }
      }
    } catch (e) {
      status = 'unlogin'
      log.info(PRE, `login fail: WeChat is not activated ${e}`)
      if (!firstTime) {
        await this.onStop()
      }
    }

    this.emit('heartbeat', { data: `heartbeat@engine:${status}` })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this._heartBeatTimer = setTimeout(async (): Promise<void> => {
      await this._startPuppetHeart(false)
      return undefined
    }, 15 * 1000) // 15s
  }

  // 停止监听心跳
  private _stopPuppetHeart () {
    if (!this._heartBeatTimer) {
      return
    }

    clearTimeout(this._heartBeatTimer)
    this._heartBeatTimer = undefined
  }

  /**
   * 解析图片
   * @param messageId
   * @param messagePayload
   * @private
   */
  private async _getMessageImageFileBox (messageId: string, messagePayload: MessagePayload):Promise<FileBoxInterface> {
    const message: PUPPET.payloads.Message = await this.messageRawPayloadParser(messagePayload)
    if (!message.text) {
      throw new Error(`Can not get file for message: ${messageId}`)
    }
    if (message.type !== PUPPET.types.Message.Image) {
      throw new Error(`message ${messageId} is not image type message`)
    }
    const reg = /\[pic=(.+),isDecrypt=(.+)]/
    const res = message.text && reg.exec(message.text)
    const path = res?.[1]
    const isDecrypt = res?.[2]
    await delay(4000)
    if (this.options.runLocal && path && !fs.existsSync(path)) {
      log.error(PRE, `Can not get file path: ${messageId} , isDecrypt${isDecrypt}`)
    }
    // 如果文件已经解密
    if (path && isDecrypt && isDecrypt === '1') {
      // 如果服务运行在本地 直接读取文件
      if (this.options.runLocal) {
        return FileBox.fromFile(path, `message-${messageId}-image.png`)
      } else {
        // 不在本地运行，拉取图片数据流
        const fileName = getFileName(path)
        const fileBox = await this._client?.getImage(fileName)
        if (fileBox) {
          return fileBox
        }
      }
    } else if (path && isDecrypt === '0') {
      if (this.options.runLocal) {
        const imageInfo = ImageDecrypt(path, messageId)
        const base64 = imageInfo.base64
        const fileName = `message-${messageId}-url.${imageInfo.extension}`
        return FileBox.fromBase64(
          base64,
          fileName,
        )
      }
    }
    throw new Error(`Can not get file path: ${messageId} , isDecrypt${isDecrypt}`)
  }

  /**
   * 解析文件
   * @param messageId
   * @param messagePayload
   * @private
   */
  private async _getMessageFileFileBox (messageId: string, messagePayload: MessagePayload):Promise<FileBoxInterface> {
    const message: PUPPET.payloads.Message = await this.messageRawPayloadParser(messagePayload)
    if (!message.text) {
      throw new Error(`Can not get file for message: ${messageId}`)
    }
    if (message.type !== PUPPET.types.Message.Attachment) {
      throw new Error(`message ${messageId} is not file type message`)
    }
    const reg = /\[file=(.+)]/
    const res = message.text && reg.exec(message.text)
    const path = res?.[1]
    const fileName = message.filename || ''
    await delay(1000)
    if (this.options.runLocal && path && !fs.existsSync(path)) {
      throw new Error(`Can not get file path: ${messageId} `)
    }
    // 如果文件已经解密
    if (path) {
      // 如果服务运行在本地 直接读取文件
      if (this.options.runLocal) {
        return FileBox.fromFile(path, fileName)
      } else {
        // 不在本地运行，拉取数据流
        const file = await this._client?.getFile(fileName)
        if (file) {
          return  FileBox.fromBuffer(file, fileName)
        }
      }
    }
    throw new Error(`Can not get file path: ${messageId}`)
  }

}

export { PuppetEngine, VERSION }

export default PuppetEngine
