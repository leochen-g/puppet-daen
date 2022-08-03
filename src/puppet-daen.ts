import http from 'http'

import express    from 'express'
import bodyParser from 'body-parser'
import axios      from 'axios'
import { log }              from 'wechaty-puppet'
import * as PUPPET          from 'wechaty-puppet'
import type { FileBoxInterface } from 'file-box'
import type {DaenContactRawPayload, DaenMessageRawPayload, DaenRoomRawMember, DaenRoomRawPayload} from './daen-schemas.js'
import { VERSION } from './config.js'
import { FileBox }          from 'file-box'

export type PuppetLarkServer = {
  port?: number,
}

export type PuppetLarkOptions = PUPPET.PuppetOptions & {
  larkServer?: PuppetLarkServer
}

const baseUrl = 'http://127.0.0.1:8805/DaenWxHook/client/'
type PuppetWeChatOptions = PUPPET.PuppetOptions & {
  port?          : number
}

export class PuppetDaen extends PUPPET.Puppet {

  public static override readonly  VERSION = VERSION

  app: any
  server: any
  messageStore: any
  imageStore: any
  roomJoinStore: any
  localTunnel: any

  contacts: any
  departments: any

  constructor (
    public override options: PuppetWeChatOptions = {},
  ) {
    super(options)
  }

  override async onStart (): Promise<void> {
    this.app = express()
    this.app.use(bodyParser.json({ limit: '5mb' }))
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.server = http.createServer(this.app)
    this.messageStore = {}
    this.roomJoinStore = {}
    this.imageStore = {}

    const _port = this.options.port ? this.options.port : 8089

    this.server.listen(_port, async () => {
      log.info('Server is running on ', _port, ' now.\nPlease verify it on your lark bot and app.')
    })

    this.app.post('/wechat/', (req: any, res: any) => {
      const payload = req.body
      const data = { id: ,...payload.data}
      // response according to message type
      log.info('recived data', JSON.stringify(req.body), JSON.stringify(data))
      if (payload.type === 'D0001') { // 注入成功事件
        log.info('注入成功')
      }  else if (payload.type === 'D0002') { // 登陆成功
        log.info('登陆成功')
      } else if (payload.type === 'D0003') { // 收到消息
        log.info('收到消息')
        if (data.msgSource === 0) {
          this.messageStore[data.msgSource] = data
          this.emit('message', {
            messageId: data.msgSource,
          })
        }
      }
      res.status(200).json({
        "code": 200,
        "msg": "ok",
        "timestamp": "1657121317965"
      })
      return null
    })
  }
  async postData(data: any) {
    const res = await axios({
      data,
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      url: baseUrl,
    })
    return res.data.result
  }
  override async onStop (): Promise<void> {
    await this.localTunnel.close()
  }

  override async logout (): Promise<void> {
    log.warn('There is no need to use this method \'logout\' in a lark bot.')
  }

  override ding (data?: string): void {
    const eventDongPayload = {
      data: data ? data! : 'ding-dong',
    }
    this.emit('dong', eventDongPayload)
  }

  override async contactPhone (contactId: string, phoneList: string[]): Promise<void> {
    return PUPPET.throwUnsupportedError(contactId, phoneList)
  }

  override async contactCorporationRemark (contactId: string, corporationRemark: string | null) {
    return PUPPET.throwUnsupportedError(contactId, corporationRemark)
  }
  override async tagContactAdd (tagId: string, contactId: string): Promise<void> {
    return PUPPET.throwUnsupportedError(tagId, contactId)
  }

  override async tagContactRemove (tagId: string, contactId: string): Promise<void> {
    return PUPPET.throwUnsupportedError(tagId, contactId)
  }

  override async tagContactDelete (tagId: string) : Promise<void> {
    return PUPPET.throwUnsupportedError(tagId)
  }

  override async tagContactList (contactId?: string) : Promise<string[]> {
    return PUPPET.throwUnsupportedError(contactId)
  }

  override async contactDescription (contactId: string, description: string | null) {
    return PUPPET.throwUnsupportedError(contactId, description)
  }
  /**
   *
   * ContactSelf
   *
   *
   */
  override async contactSelfQRCode (): Promise<string> {
    return PUPPET.throwUnsupportedError()
  }

  override async contactSelfName (name: string): Promise<void> {
    return PUPPET.throwUnsupportedError(name)
  }

  override async contactSelfSignature (signature: string): Promise<void> {
    return PUPPET.throwUnsupportedError(signature)
  }


  override contactAlias (contactId: string)                      : Promise<string>
  override contactAlias (contactId: string, alias: string | null): Promise<void>

  override async contactAlias (
    contactId : string,
    alias?    : string | null,
  ): Promise<string | void> {
    return PUPPET.throwUnsupportedError(alias, contactId)
  }

  override async contactAvatar (contactId: string)                          : Promise<FileBoxInterface>
  override async contactAvatar (contactId: string, file: FileBoxInterface)  : Promise<void>

  override async contactAvatar (contactId: string, file?: FileBoxInterface) : Promise<void | FileBoxInterface> {
    log.verbose('PuppetWeChat', 'contactAvatar(%s)', contactId)
    return PUPPET.throwUnsupportedError(file, contactId)
  }

  override async contactList (): Promise<string[]> {
    const response = await this.postData({type: 'Q0005', data:{type: '1'}})
    let authedEmployee: string[] = []
    if (response.length) {
      return response
    } else {
      return authedEmployee
    }
  }

  /**
   *
   * Contact
   *
   */
  override async contactRawPayload (id: string): Promise<void> {
    log.silly('PuppetWeChat', 'contactRawPayload(%s) @ %s', id, this)
  }

  override async contactRawPayloadParser (
    rawPayload: DaenContactRawPayload,
  ): Promise<PUPPET.payloads.Contact> {
    log.silly('PuppetWeChat', 'contactParseRawPayload(Object.keys(payload).length=%d)',
      Object.keys(rawPayload).length,
    )
    if (!Object.keys(rawPayload).length) {
      log.error('PuppetWeChat', 'contactParseRawPayload(Object.keys(payload).length=%d)',
        Object.keys(rawPayload).length,
      )
      log.error('PuppetWeChat', 'contactParseRawPayload() got empty rawPayload!')
      throw new Error('empty raw payload')
      // return {
      //   gender: Gender.Unknown,
      //   type:   Contact.Type.Unknown,
      // }
    }

    // this._currentUserId = rawPayload.UserName
    // MMActualSender??? MMPeerUserName??? `getUserContact(message.MMActualSender,message.MMPeerUserName).HeadImgUrl`

    // uin:        rawPayload.Uin,    // stable id: 4763975 || getCookie("wxuin")

    return {
      address:    rawPayload.Alias, // XXX: need a stable address for user
      alias:      rawPayload.RemarkName,
      avatar:     rawPayload.HeadImgUrl,
      city:       rawPayload.City,
      friend:     rawPayload.stranger === undefined
        ? undefined
        : !rawPayload.stranger, // assign by injectio.js
      gender:     rawPayload.Sex,
      id:         rawPayload.UserName,
      name:      rawPayload.NickName,
      phone: [],
      province:   rawPayload.Province,
      signature:  rawPayload.Signature,
      star:       !!rawPayload.StarFriend,
      /**
       * @see 1. https://github.com/Chatie/webwx-app-tracker/blob/
       *  7c59d35c6ea0cff38426a4c5c912a086c4c512b2/formatted/webwxApp.js#L3243
       * @see 2. https://github.com/Urinx/WeixinBot/blob/master/README.md
       * @ignore
       */
      type:      (!!rawPayload.UserName && !rawPayload.UserName.startsWith('@@') && !!(rawPayload.VerifyFlag & 8))
        ? PUPPET.types.Contact.Official
        : PUPPET.types.Contact.Individual,
      weixin:     rawPayload.Alias,  // Wechat ID
    }
  }

  override async friendshipAccept (
    friendshipId : string,
  ): Promise<void> {
    console.log('id', friendshipId)
  }

  override async friendshipAdd (
    contactId : string,
    hello     : string,
  ): Promise<void> {
    console.log('id', contactId, hello)
  }

  override async friendshipSearchPhone (phone: string): Promise<null | string> {
    throw PUPPET.throwUnsupportedError(phone)
  }

  override async friendshipSearchWeixin (weixin: string): Promise<null | string> {
    throw PUPPET.throwUnsupportedError(weixin)
  }

  override async friendshipRawPayload (id: string): Promise<DaenMessageRawPayload | void> {
    log.warn('PuppetWeChat', 'friendshipRawPayload(%s)', id)
  }

  override async friendshipRawPayloadParser (rawPayload: DaenMessageRawPayload): Promise<PUPPET.payloads.Friendship> {
    log.warn('PuppetWeChat', 'friendshipRawPayloadParser(%s)', rawPayload)
    switch (rawPayload.msgType) {
      default:
        throw new Error('not supported friend request message raw payload')
    }
  }

  override async messageContact (messageId: string): Promise<string> {
    log.verbose('PuppetWeChat', 'messageContact(%s)', messageId)
    return PUPPET.throwUnsupportedError(messageId)
  }

  override async messageFile (messageId: string): Promise<FileBoxInterface> {
    const filePath = this.messageStore[messageId].file_key
    const file = FileBox.fromFile(filePath, '')
    return file
  }

  override async messageImage (messageId: string, imageType: PUPPET.types.Image): Promise<FileBoxInterface> {
    const imagePath = this.messageStore[messageId].image_key
    console.log('imageType', imageType)
    const file = FileBox.fromFile(imagePath, 'image.png')
    return file
  }

  override async messageMiniProgram (messageId: string): Promise<PUPPET.payloads.MiniProgram> {
    log.verbose('PuppetWeChat', 'messageMiniProgram(%s)', messageId)
    return PUPPET.throwUnsupportedError(messageId)
  }

  override async messageUrl (messageId: string)  : Promise<PUPPET.payloads.UrlLink> {
    return PUPPET.throwUnsupportedError(messageId)
  }

  override async messageSendContact (
    conversationId : string,
    contactId      : string,
  ): Promise<void> {
    log.verbose('PuppetWeChat', 'messageSend("%s", %s)', conversationId, contactId)
    return PUPPET.throwUnsupportedError()
  }

  override async messageSendFile (conversationId: string, file: FileBoxInterface): Promise<void> {
    console.log(' messageSendFile', conversationId, file)
  }

  override async messageSendMiniProgram (conversationId: string, miniProgramPayload: PUPPET.payloads.MiniProgram): Promise<void> {
    log.verbose('PuppetWeChat', 'messageSendMiniProgram("%s", %s)',
      conversationId,
      JSON.stringify(miniProgramPayload),
    )
    PUPPET.throwUnsupportedError(conversationId, miniProgramPayload)
  }

  override async messageSendText (conversationId: string, text: string): Promise<string | void> {
    await this.postData({type: 'Q0001', data: { wxid: conversationId, msg:text } })
  }

  override async messageSendUrl (conversationId: string, urlLinkPayload: PUPPET.payloads.UrlLink): Promise<string | void> {
    await this.postData({type: 'Q0001', data: { wxid: conversationId, title: urlLinkPayload.title, content: urlLinkPayload.description, jumpUrl: urlLinkPayload.url, path: urlLinkPayload.thumbnailUrl } })
  }

  override async messageRecall (messageId: string): Promise<boolean> {
    return PUPPET.throwUnsupportedError(messageId)
  }

  override async messageRawPayload (messageId: string): Promise<any> {
    return this.messageStore[messageId]
  }

  override async messageRawPayloadParser (rawPayload: DaenMessageRawPayload,): Promise<PUPPET.payloads.Message> {
    // Lark message Payload -> Puppet message payload
    log.verbose('PuppetWeChat', 'messageRawPayloadParser(%s) @ %s', rawPayload, this)
    const payloadBase = {
      id: '',
      mentionIdList: [],
      talkerId: rawPayload.fromWxid,
      text: rawPayload.msg,
      timestamp: parseInt(rawPayload.timeStamp),
      type: rawPayload.msgSource,
      listenerId: '',
      roomId: ''
    }
    return payloadBase
  }

  /**
   *
   * Room Invitation
   *
   */
  override async roomInvitationAccept (roomInvitationId: string): Promise<void> {
    return PUPPET.throwUnsupportedError(roomInvitationId)
  }

  override async roomInvitationRawPayload (roomInvitationId: string): Promise<any> {
    return PUPPET.throwUnsupportedError(roomInvitationId)
  }

  override async roomInvitationRawPayloadParser (rawPayload: any): Promise<PUPPET.payloads.RoomInvitation> {
    return PUPPET.throwUnsupportedError(rawPayload)
  }


  override async roomAdd (
    roomId    : string,
    contactId : string,
  ): Promise<void> {
    return PUPPET.throwUnsupportedError(roomId, contactId)
  }

  override async roomAvatar (roomId: string): Promise<FileBoxInterface> {
    return PUPPET.throwUnsupportedError(roomId)
  }

  override async roomCreate (
    contactIdList : string[],
    topic         : string,
  ): Promise<string> {
    return PUPPET.throwUnsupportedError(contactIdList,topic )
  }

  override async roomDel (
    roomId    : string,
    contactId : string,
  ): Promise<void> {
    return PUPPET.throwUnsupportedError(roomId, contactId)
  }

  override async roomList (): Promise<string[]> {
    return PUPPET.throwUnsupportedError('')
  }

  override async roomQRCode (roomId: string): Promise<string> {
    return PUPPET.throwUnsupportedError(roomId)
  }

  override async roomQuit (roomId: string): Promise<void> {
    log.warn('PuppetWeChat', 'roomQuit(%s) not supported by Web API', roomId)
  }

  override async roomTopic (roomId: string)                : Promise<string>
  override async roomTopic (roomId: string, topic: string) : Promise<void>

  override async roomTopic (
    roomId : string,
    topic? : string,
  ): Promise<void | string> {
    log.warn('PuppetWeChat', 'roomQuit(%s) not supported by Web API', roomId, topic)
  }

  override async roomRawPayload (id: string): Promise<void> {
    log.verbose('PuppetWeChat', 'roomRawPayload(%s)', id)
  }

  override async roomRawPayloadParser (
    rawPayload: DaenRoomRawPayload ,
  ): Promise<PUPPET.payloads.Room> {
    return PUPPET.throwUnsupportedError(rawPayload)
  }

  override async roomAnnounce (roomId: string)                : Promise<string>
  override async roomAnnounce (roomId: string, text: string)  : Promise<void>

  override async roomAnnounce (roomId: string, text?: string) : Promise<void | string> {
    log.warn('PuppetWeChat', 'roomAnnounce(%s, %s) not supported', roomId, text || '')

    if (text) {
      return
    }
    return ''
  }

  override async roomMemberList (roomId: string) : Promise<string[]> {
    log.verbose('PuppetWeChat', 'roommemberList(%s)', roomId)
    return []
  }

  override async roomMemberRawPayload (roomId: string, contactId: string): Promise<void>  {
    log.verbose('PuppetWeChat', 'roomMemberRawPayload(%s, %s)', roomId, contactId)
  }

  override async roomMemberRawPayloadParser (rawPayload: DaenRoomRawMember): Promise<PUPPET.payloads.RoomMember>  {
    log.verbose('PuppetWeChat', 'roomMemberRawPayloadParser(%s)', rawPayload)

    const payload: PUPPET.payloads.RoomMember = {
      avatar    : rawPayload.HeadImgUrl,
      id        : rawPayload.UserName,
      name      : rawPayload.NickName,
      roomAlias : rawPayload.DisplayName,
    }
    return payload
  }

}
export default PuppetDaen
