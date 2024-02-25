import axios from 'axios'
import express from 'express'
import bodyParser from 'body-parser'
import { log } from 'wechaty-puppet'
import { FileBox, FileBoxInterface } from 'file-box'
import { EventEmitter } from 'events'
import http from 'http'
// 为了生成随机id使用 如果接口自带 此处可不引用
import cuid from 'cuid'

const PRE = '[PuppetEngine]'

/**
 * 创建实例传过来的参数
  */
export type PuppetEngineOptions =  {
  runLocal?: boolean, // 服务是否运行在本地
  port?: number | string | undefined, // 当前服务的端口号 默认 8089
  httpServer?: string // 注入的服务调用地址 根据实际情况填写 也有可能是 长连接地址
}

/**
 * 性别
 */
enum ContactGender {
  Unknown = 0, // 位置
  Male    = 1, // 男
  Female  = 2, // 女
}

/**
 * 群成员
 */
export interface ChatRoomMember {
  wxid: string, // wxid
  groupNick: string, // 群昵称
  avatarMinUrl?: string,
  avatarMaxUrl?: string,
  avatar?: string, // 头像
  inviterUserName?: string // 邀请人
  displayName?: string // 群备注
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
  ownerId?: string,
  /**
   * 是否好友
   */
  isFriend?: number
  /**
   * 加好友场景 来源，1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
   */
  scene?: string
  device?: string
  qq?: string
  phone?: string
  email?: string
}

/**
 * 聊天记录 此处没有用到
 */
export interface RecordList {
  wxid: string; // 发送此条消息的人的wxid
  nickName: string; // 显示的昵称 可随意伪造
  timestamp: string; // 10位时间戳
  msg: string; // 消息内容
}

/**
 * 微信登录状态
 */
enum Status {
  normal = 'normal',
  pending = 'pending',
  fail = 'fail'
}

/**
 * 登录状态
 */
export interface StatsResult {
  status: Status
  msg: string
  wxid?: string
  name: string
  wxNum?: string;
}

export type ClientEvent = 'kickout' | 'contact' | 'message';

/**
 * 消息来源：0|别人发送 1|自己手机发送
 * 如果是转账消息：1|收到转账 2|对方接收转账 3|发出转账 4|自己接收转账 5|对方退还 6|自己退还
 */
export enum MsgSource {
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

enum FromType {
  CONTACT = 1,
  ROOM = 2,
  OFFICE = 3,
}

/**
 * 消息类型：1|文本 3|图片 34|语音 42|名片 43|视频 47|动态表情 48|地理位置 49|分享链接或附件 2001|红包 2002|小程序 2003|群邀请 10000|系统消息
 */
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

/**
 * 收到的消息格式
 */
export interface MessagePayload {
  id: string, // 消息id
  timeStamp: number, // 10位时间戳
  talkerId: string, // 发消息 人 或者 群
  text: string, // 消息内容
  fromType: FromType,
  msgType?: WechatMessageType,
  msgSource?: MsgSource,
  fromWxid: string, // fromType=1时为好友wxid，fromType=2时为群wxid，fromType=3时公众号wxid
  finalFromWxid: string, // 仅fromType=2时有效，为群内发言人wxid
  atWxidList?: string[], // 仅fromType=2，且msgSource=0时有效，为消息中艾特人wxid列表
  silence?: number, // 仅fromType=2时有效，0
  membercount?: number, // 仅fromType=2时有效，群成员数量
  signature?: string, // 消息签名
  msg: string, // 消息内容
  listenerId: string, //
  transferid?: string, // 转账id
  memo?: string, // 转账备注
  money?: string, // 转账金额
  transType?: string // 1|即时到账 2|延时到账
}

export interface BaseEvent {
  errorCode: number;
  errorMessage: string;
  wxid?: string;
  name?: string,
  robotInfo?: ContactPayload
}

export interface ContactEvent {
  friendShip: MessagePayload,
  contactInfo: ContactPayload
}

class Client extends EventEmitter {

  private readonly options: PuppetEngineOptions
  app: any
  server: any

  // @ts-ignore
  override emit(event: 'hook', detail: BaseEvent): boolean;
  override emit(event: 'login', detail: BaseEvent): boolean;
  override emit(event: 'message', messageList: MessagePayload): boolean;
  override emit(event: 'contact', detail: ContactEvent): boolean;

  override emit (event: ClientEvent, ...args: any[]): boolean {
    return super.emit(event, ...args)
  }

  public static async create (options: PuppetEngineOptions) {
    return new Client(options)
  }

  private constructor (options: PuppetEngineOptions = {}) {
    super()
    this.options = options
    this.initServer()
  }

  initServer () {
    if (!this.app && !this.server) {
      this.app = express()
      this.app.use(bodyParser.json({ limit: '200mb' }))
      this.app.use(bodyParser.urlencoded({ extended: true }))
      this.server = http.createServer(this.app)
      const _port = this.options.port
      this.server.listen(_port, () => {
        log.info(PRE, `Server is running on ${_port}`)
      })
      this.eventListen()
    }
  }

  eventListen () {
    this.app.post('/wechat/', async (req: any, res: any) => {
      const { type, data, wxid } = req.body
      // response according to message type
      log.verbose(PRE, `on event:${JSON.stringify(data)}`)
      let robotInfo: ContactPayload
      switch (type) {
        case 'D0001':
          this.emit('hook', { errorCode: 0, errorMessage: 'success' })
          break
        case 'D0002':
          log.verbose(PRE, 'login event')
          robotInfo = {
            avatar: data.avatarUrl || '',
            city: data.city || '',
            country: data.country || '',
            province: data.province || '',
            sex: data.sex || '',
            name: data.nick || '',
            wxid: data.wxid || '',
            wxNum: data.wxNum || '',
            device: data.device || '',
            phone: data.phone || '',
            qq: data.qq || '',
            email: data.email || '',
          }
          this.emit('login', { errorCode: 0, errorMessage: 'success', name: data.nick, wxid, robotInfo })
          break
        case 'D0003': {
          log.verbose(PRE, 'recive message')
          // 兼容新的协议自己发消息也会有事件
          if (data.msgSource === 0) {
            if ((data.msgTag && data.msgTag === 1050) || (data.msgTag && data.msgTag === 1005) || data.msgType === WechatMessageType.Text || !data.msgTag) {
              const msg: MessagePayload = {
                ...data,
                text: data.msg,
                avatar: data.avatarMaxUrl || data.avatarMinUrl || data.avatarUrl || '',
                id: cuid(),
                listenerId: wxid,
              }
              this.emit('message', msg)
            }
          }
          break
        }
        case 'D0004': {
          log.verbose(PRE, 'transfer message')
          const transferMsg: MessagePayload = {
            ...data,
            id: cuid(),
            listenerId: wxid,
            text: data.money + '-' + data.transferid + '-' + data.memo,
            msg: data.money + '-' + data.transferid + '-' + data.memo,
            msgType: WechatMessageType.Transfer,
            timeStamp: Number(data.invalidtime),
          }
          this.emit('message', transferMsg)
          break
        }
        case 'D0005':
          log.verbose(PRE, 'recall message')
          break
        case 'D0006': {
          log.verbose(PRE, 'friend request')
          const friendShip = {
            ...data,
            remark: data.remark || '',
            contactId: data.wxid,
            hello: data.content,
            id: cuid(),
            scene: Number(data.scene),
            ticket: data.v3 + '-' + data.v4,
            timestamp: Number(data.timestamp),
            type: 2,
          }
          const contactInfo = {
            avatar: data.avatarMaxUrl || data.avatarMinUrl || '',
            city: data.city || '',
            country: data.country || '',
            province: data.province || '',
            sex: data.sex || '',
            name: data.nick || '',
            wxid: data.wxid || '',
            wxNum: data.wxNum || '',
            device: '',
            phone: '',
            qq: '',
            email: '',
            sign: data.sign || '',
          }
          this.emit('contact', { friendShip, contactInfo })
          break
        }
      }
      res.status(200).json({
        code: 200,
        msg: 'ok',
        timestamp: '1657121317965',
      })
      return null
    })
  }

  async postData (data: any) {
    const res = await axios({
      data,
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      url: this.options.httpServer + '/DaenWxHook/client/',
    })
    try {
      const result = typeof res.data === 'string' ? this.jsonParse(res.data) : res.data
      if (parseInt(result.code) === 200) {
        return Array.isArray(result.result) ? result.result : { ...result.result, robotId: result.wxid }
      } else {
        log.info(PRE, `Error: onPost${result}`)
        return { code: Number(result.code), errorMsg: result.msg, result: result.result }
      }
    } catch (e:any) {
      log.error('post error：数据解析错误', e)
      const startIndex = e.message.indexOf('position') + 9
      const endIndex = e.message.indexOf('of the JSON') - 1
      const invalidPart = res.data.substring(startIndex, endIndex)
      console.warn('无法解析的部分:', invalidPart)
    }
  }

  jsonParse (str: string) {
    if (!str) return {}
    try {
      const res = JSON.parse(str.replaceAll('\x07', '').replaceAll('\x1F', '').replaceAll(/[^\x00-\x7F]/g, ''))
      return res
    } catch (e) {
      log.warn('强制解析json', str)
      /* eslint no-eval: 0 */
      const res = eval('(' + str + ')')
      return res
    }
  }

  /**
   * 获取微信运行状态
   */
  public async getStats (): Promise<StatsResult> {
    const res = await this.postData({
      data: {},
      type: 'Q0000',
    })
    if (res) {
      const { code, errorMsg, wxid, nick } = res
      if (!code) {
        return { status: Status.normal, wxid, msg: errorMsg, name: nick }
      } else {
        return { status: Status.pending, wxid, msg: errorMsg, name: nick }
      }
    } else {
      log.info(PRE, 'login fail')
      return { status: Status.fail, wxid: '', msg: '未启动微信或未注入成功', name:' ' }
    }
  }

  /**
   * 获取微信运行状态修改下载图片
   * @param type
   * 1 “23:30-23:30”为全天下载
   * 2 “00:01-23:59”为全天不下载
   */
  public async setDownloadImg (type: number = 1): Promise<void> {
    const typeMap: any = {
      1: '23:30-23:30',
      2: '00:01-23:59',
    }
    return await this.postData({
      data: {
        type: typeMap[type],
      },
      type: 'Q0002',
    })

  }

  /**
   * 获取当前bot信息
   */
  public async getSelfInfo (): Promise<ContactPayload> {
    const selfContact = await this.postData({
      type: 'Q0003',
      data: {},
    })
    selfContact['name'] = selfContact.nick
    return selfContact
  }

  /**
   * 查询对象信息
   * @param contactId
   */
  public async searchContact (contactId: string): Promise<ContactPayload | undefined> {
    const contact = await this.postData({
      type: 'Q0004',
      data: {
        wxid: contactId,
      },
    })
    if (contact && contact.wxid || contact && contact.userName) {
      return {
        ...contact,
        wxNum: contact.wxNum || contact.alias,
        wxid: contact.wxid || contact.userName,
        name: contact.nick || contact.nickName,
        alias: contact.alias || contact.remark,
        avatar: contact.avatarMaxUrl || contact.avatarMinUrl || contact.bigHeadImgUrl || contact.smallHeadImgUrl,
      }
    }
    return undefined
  }

  /**
   * 获取好友列表
   * @param type 1=从缓存中获取，2=重新遍历二叉树并刷新缓存
   */
  public async getContactList (type: string = '2'): Promise<ContactPayload[]> {
    const list = await this.postData({
      type: 'Q0005',
      data: {
        type,
      },
    }) || []
    const contactList: ContactPayload[] = list.filter((item:any) => item.wxid).map((item:any) => {
      return {
        ...item,
        isFriend: true,
        name: item.nick,
        avatar: item.avatarMaxUrl || item.avatarMinUrl,
      }
    })
    return contactList
  }

  /**
   * 获取群聊列表
   * @param type 1=从缓存中获取，2=重新遍历二叉树并刷新缓存
   */
  public async getGroupList (type: string = '2'): Promise<ContactPayload[]> {
    const list: ContactPayload[] = await this.postData({
      type: 'Q0006',
      data: {
        type,
      },
    }) || []
    const groupList: ContactPayload[] = list.filter((item:any) => item.wxid).map((item:any) => {
      return {
        ...item,
        name: item.nick,
        avatar: item.avatarMaxUrl || item.avatarMinUrl,
      }
    })
    return groupList
  }

  /**
   * 获取群成员列表
   * @param roomId 群id
   */
  public async getGroupMembers (roomId: string): Promise<ChatRoomMember[]> {
    const list: ChatRoomMember[] = await this.postData({
      type: 'Q0008',
      data: {
        wxid: roomId,
      },
    }) || []
    return list.filter((item:any) => item.wxid).map(item => ({ ...item, avatar: item.avatarMaxUrl || item.avatarMinUrl }))
  }

  /**
   * 获公众号聊列表
   * @param type 1=从缓存中获取，2=重新遍历二叉树并刷新缓存
   */
  public async getOfficeList (type: string = '1'): Promise<ContactPayload[]> {
    const list: ContactPayload[] = await this.postData({
      type: 'Q0007',
      data: {
        type,
      },
    }) || []
    return list.filter((item:any) => item.wxid)
  }

  /**
   * 发送文本消息
   * @param contactId
   * @param msg
   * 1.消息内支持文本代码，详情见文本代码章节
   * 2.微信最多支持4096个字符，相当于2048个汉字，请勿超出否则崩溃
   */
  public async sendText (contactId: string, msg: string): Promise<void> {
    await this.postData({
      type: 'Q0001',
      data: {
        wxid: contactId,
        msg,
      },
    })

  }

  /**
   * 发送聊天记录
   * @param contactId 要给谁，支持好友、群聊、公众号等
   * @param title 仅供电脑上显示用，手机上的话微信会根据[显示昵称]来自动生成 谁和谁的聊天记录
   * @param dataList RecordList[] 聊天的内容
   */
  public async sendRecord (contactId: string, title: string, dataList: RecordList[]): Promise<void> {
    await this.postData({
      type: 'Q0009',
      data: {
        wxid: contactId,
        title,
        dataList,
      },
    })

  }

  /**
   * 发送本地图片
   * @param contactId 要给谁，支持好友、群聊、公众号等
   * @param path 本地图片路径
   */
  public async sendLocalImg (contactId: string, path: string): Promise<void> {
    await this.postData({
      data: {
        path,
        wxid: contactId,
      },
      type: 'Q0010',
    })

  }

  /**
   * 发送本地文件
   * @param contactId 要给谁，支持好友、群聊、公众号等
   * @param path 本地文件路径
   */
  public async sendLocalFile (contactId: string, path: string): Promise<void> {
    await this.postData({
      type: 'Q0011',
      data: {
        wxid: contactId,
        path,
      },
    })

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
  public async sendShareCard ({
    contactId,
    title,
    content,
    jumpUrl,
    app,
    path,
  }: { contactId: string, title: string, content: string | undefined, jumpUrl: string, app?: string, path: string | undefined }): Promise<void> {
    await this.postData({
      type: 'Q0012',
      data: {
        wxid: contactId,
        title,
        content,
        jumpUrl,
        app,
        path,
      },
    })

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
  public async sendMiniProgram ({
    contactId,
    title,
    content,
    jumpUrl,
    gh,
    path,
  }: { contactId: string | undefined, title: string | undefined, content: string | undefined, jumpUrl: string | undefined, gh: string | undefined, path: string | undefined }): Promise<void> {
    await this.postData({
      type: 'Q0013',
      data: {
        wxid: contactId,
        title,
        content,
        jumpPath: jumpUrl,
        gh,
        path,
      },
    })

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
  public async sendMusic ({
    contactId,
    name,
    author,
    app,
    jumpUrl,
    musicUrl,
    imageUrl,
  }: { contactId: string | undefined, name: string | undefined, author: string | undefined, jumpUrl: string | undefined, musicUrl: string | undefined, imageUrl: string | undefined, app: string | undefined }): Promise<void> {
    await this.postData({
      type: 'Q0014',
      data: {
        wxid: contactId,
        name,
        author,
        app,
        jumpUrl,
        musicUrl,
        imageUrl,
      },
    })

  }

  /**
   * 发送xml消息
   * XML里<fromusername>wxid_3sq4tklb6c3121</fromusername>必须为自己的wxid，切记
   * @param contactId
   * @param xml
   * 1.消息内支持文本代码，详情见文本代码章节
   * 2.微信最多支持4096个字符，相当于2048个汉字，请勿超出否则崩溃
   */
  public async sendXml (contactId: string, xml: string): Promise<void> {
    await this.postData({
      type: 'Q0001',
      data: {
        wxid: contactId,
        xml,
      },
    })

  }

  /**
   * 确认收款
   * @param contactId
   * @param transferid
   */
  public async confirmTransfer (contactId: string, transferid: string): Promise<void> {
    await this.postData({
      type: 'Q0016',
      data: {
        wxid: contactId,
        transferid,
      },
    })

  }

  /**
   * 同意好友请求
   * @param scene 来源
   * @param v3 v3
   * @param v4 v4
   */
  public async confirmFriendship (scene: string | number | undefined, v3: string | undefined, v4: string | undefined): Promise<void> {
    await this.postData({
      type: 'Q0017',
      data: {
        scene: scene && scene.toString(),
        v3,
        v4,
      },
    })

  }

  /**
   * 添加好友_通过v3
   * @param scene 来源 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
   * @param v3 可通过查询陌生人信息获得
   * @param content 打招呼内容
   * @param type 1=新朋友，2=互删朋友（此时来源将固定死为3）
   */
  public async addFriendByV3 ({
    scene,
    v3,
    content,
    type,
  }: { scene: string | undefined, content: string | undefined, type: number | undefined, v3: string | undefined, }): Promise<void> {
    await this.postData({
      type: 'Q0018',
      data: {
        scene,
        v3,
        content,
        type,
      },
    })

  }

  /**
   * 添加好友_通过v3
   * @param scene 来源 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
   * @param content 打招呼内容
   * @param wxid wxid
   */
  public async addFriendByWxid ({
    scene,
    wxid,
    content,
  }: { scene: string | undefined, content: string | undefined, wxid: string | undefined, }): Promise<void> {
    await this.postData({
      type: 'Q0019',
      data: {
        scene,
        wxid,
        content,
      },
    })

  }

  /**
   * 查询陌生人信息
   * @param content 手机号或者QQ
   */
  public async searchStranger (content: string): Promise<ContactPayload> {
    const res = await this.postData({
      type: 'Q0020',
      data: {
        pq: content,
      },
    })

    return {
      ...res,
      name: res.nick,
      ticket: res.v3 + '-' + res.v4,
      avatarUrl: res.avatarMaxUrl || res.avatarMinUrl || '',
      wxid: res.isFriend === '1' ? res.pq : '',
      isFriend: Number(res.isFriend),
    }
  }

  /**
   * 邀请进群
   * @param groupId 群id
   * @param contactId 好友wxid
   * @param type 类型 1直接拉  2 发送邀请链接
   */
  public async inviteToGroup (groupId: string, contactId: string, type: number = 1): Promise<void> {
    await this.postData({
      type: 'Q0021',
      data: {
        wxid: groupId,
        objWxid: contactId,
        type,
      },
    })

  }

  /**
   * 删除好友
   * @param contactId 好友wxid
   */
  public async removeContact (contactId: string): Promise<void> {
    await this.postData({
      type: 'Q0022',
      data: {
        wxid: contactId,
      },
    })

  }

  /**
   * 设置好友备注
   * @param contactId 好友wxid
   * @param remark 支持emoji、微信表情
   */
  public async setContactAlias (contactId: string, remark: string): Promise<void> {
    await this.postData({
      type: 'Q0023',
      data: {
        wxid: contactId,
        remark,
      },
    })

  }

  /**
   * 修改群名
   * @param groupId 群id
   * @param name 群名
   */
  public async setGroupName (groupId: string, name: string | undefined): Promise<void> {
    await this.postData({
      type: 'Q0024',
      data: {
        wxid: groupId,
        nick: name,
      },
    })

  }

  /**
   * 发送名片
   * @param contactId 接收人id
   * @param xml 名片xml
   */
  public async sendContactCard (contactId: string, xml: string | any): Promise<void> {
    await this.postData({
      type: 'Q0025',
      data: {
        wxid: contactId,
        nick: xml,
      },
    })

  }

  /**
   * 获取登录二维码
   */
  public async getQrcode (): Promise<string> {
    const res = await this.postData({
      type: 'Q0026',
      data: {},
    })

    return res.qrcode || ''
  }

  /**
   * 获取图片数据
   */
  public async getImage (img: string): Promise<FileBoxInterface> {
    return FileBox.fromUrl(`${this.options.httpServer}/DaenWxHook/client/view/?name=${img}`)
  }

  /**
   * 获取图片数据
   */
  public async getFile (name: string): Promise<Buffer> {
    const curDate = new Date()
    const year = curDate.getFullYear()
    let month: any = curDate.getMonth() + 1
    if (month < 10) {
      month = '0' + month
    }
    const res = await axios.get(this.options.httpServer + '/DaenWxHook/client/down/', {
      params: {
        name,
        date: `${year}-${month}`,
      },
    })
    return res.data
  }

  /**
   * 发送群公告
   * @param roomId 群id
   * @param content 公告内容
   */
  public async sendAnnouncement (roomId: string, content: string): Promise<void> {
    await axios({
      data: {
        api: 2214,
        data: {
          chatRoomName: roomId,
          content,
        },
      },
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      url: this.options.httpServer,
    })
  }

}

export default Client
