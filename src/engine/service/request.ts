import axios from 'axios'
import { log } from 'wechaty-puppet'
import type { PuppetEngineOptions } from '../../puppet-engine.js'
import type { ContactPayload } from '../../engine-schema.js'

const PRE = '[PuppetEngine]'

export interface RoomMember {
  groupNick: string;
  wxid:      string;
}
export interface RecordList {
  wxid: string; // 发送此条消息的人的wxid
  nickName: string; // 显示的昵称 可随意伪造
  timestamp: string; // 10位时间戳
  msg: string; // 消息内容
}

export interface StatsResult {
  code?: number,
  errorMsg?: string,
  /**
   * 昵称
   */
  nick: string;
  /**
   * 接收消息数
   */
  recv: number;
  /**
   * 已运行时间
   */
  runTime: string;
  /**
   * 发送消息数
   */
  send: number;
  /**
   * 开始运行时间
   */
  startTime: string;
  /**
   * 开始运行时间戳
   */
  startTimeStamp: string;
  /**
   * wxid
   */
  wxid: string;
  /**
   * 微信号
   */
  wxNum: string;
}

class Client {

  private readonly options: PuppetEngineOptions;
  constructor (options: PuppetEngineOptions = {}) {
    this.options = options
  }

  async postData (data: any) {
    const res = await axios({
      data,
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      url: this.options.httpServer,
    })
    if (res.data.code === 200) {
      return Array.isArray(res.data.result) ? res.data.result : { ...res.data.result, robotId: res.data.wxid }
    } else {
      log.info(PRE, 'Error: onPost', res.data.msg)
      return { code: Number(res.data.code), errorMsg: res.data.msg, result: res.data.result }
    }
  }

  /**
   * 获取微信运行状态
   */
  public async getStats (): Promise<StatsResult> {
    const stats = await this.postData({
      type: 'Q0000',
      data: {},
    })
    return stats
  }

  /**
   * 获取微信运行状态修改下载图片
   * @param type
   * 1 “23:30-23:30”为全天下载
   * 2 “00:01-23:59”为全天不下载
   */
  public async setDownloadImg (type:number = 1): Promise<void> {
    const typeMap: any = {
      1: '23:30-23:30',
      2: '00:01-23:59',
    }
    await this.postData({
      type: 'Q0002',
      data: {
        type: typeMap[type],
      },
    })

  }

  /**
   * 获取当前bot信息
   */
  public async getSelfInfo ():Promise<ContactPayload> {
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
  public async searchContact (contactId:string):Promise<ContactPayload> {
    const contact = await this.postData({
      type: 'Q0004',
      data: {
        wxid: contactId,
      },
    })
    contact['name'] = contact.nick
    contact['avatarUrl'] = contact.avatarMaxUrl | contact.avatarMinUrl
    return contact
  }

  /**
   * 获取好友列表
   * @param type 1=从缓存中获取，2=重新遍历二叉树并刷新缓存
   */
  public  async getContactList (type:string = '1'):Promise<ContactPayload[]> {
    const list:ContactPayload[] = await this.postData({
      type: 'Q0005',
      data: {
        type: type,
      },
    })
    return list
  }

  /**
   * 获取群聊列表
   * @param type 1=从缓存中获取，2=重新遍历二叉树并刷新缓存
   */
  public async getGroupList (type:string = '1'):Promise<ContactPayload[]> {
    const list:ContactPayload[] = await this.postData({
      type: 'Q0006',
      data: {
        type: type,
      },
    })
    return list
  }

  /**
   * 获取群成员列表
   * @param roomId 群id
   */
  public  async getGroupMembers (roomId:string):Promise<RoomMember[]> {
    const list:RoomMember[] = await this.postData({
      type: 'Q0008',
      data: {
        wxid: roomId,
      },
    })
    return list
  }

  /**
   * 获公众号聊列表
   * @param type 1=从缓存中获取，2=重新遍历二叉树并刷新缓存
   */
  public async getOfficeList (type:string = '1'):Promise<ContactPayload[]> {
    const list:ContactPayload[] = await this.postData({
      type: 'Q0007',
      data: {
        type: type,
      },
    })
    return list
  }

  /**
   * 发送文本消息
   * @param contactId
   * @param msg
   * 1.消息内支持文本代码，详情见文本代码章节
   * 2.微信最多支持4096个字符，相当于2048个汉字，请勿超出否则崩溃
   */
  public async sendText (contactId: string, msg:string): Promise<void> {
    await this.postData({
      type: 'Q0001',
      data: {
        wxid: contactId,
        msg: msg,
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
        title: title,
        dataList: dataList,
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
      type: 'Q0010',
      data: {
        wxid: contactId,
        path: path,
      },
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
        path: path,
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
  public async sendShareCard ({ contactId, title, content, jumpUrl, app, path }:{contactId:string, title: string, content: string|undefined, jumpUrl: string, app?: string, path: string|undefined}): Promise<void> {
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
  public async sendMiniProgram ({ contactId, title, content, jumpUrl, gh, path }:{contactId:string|undefined, title: string|undefined, content: string|undefined, jumpUrl: string|undefined, gh: string|undefined, path: string|undefined}): Promise<void> {
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
  public async sendMusic ({ contactId, name, author, app, jumpUrl, musicUrl, imageUrl }:{contactId:string|undefined, name: string|undefined, author: string|undefined, jumpUrl: string|undefined, musicUrl: string|undefined, imageUrl: string|undefined, app: string|undefined}): Promise<void> {
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
  public async sendXml (contactId: string, xml:string): Promise<void> {
    await this.postData({
      type: 'Q0001',
      data: {
        wxid: contactId,
        xml: xml,
      },
    })

  }

  /**
   * 确认收款
   * @param contactId
   * @param transferid
   */
  public async confirmTransfer (contactId: string, transferid:string): Promise<void> {
    await this.postData({
      type: 'Q0016',
      data: {
        wxid: contactId,
        transferid: transferid,
      },
    })

  }

  /**
   * 同意好友请求
   * @param scene 来源
   * @param v3 v3
   * @param v4 v4
   */
  public async confirmFriendship (scene: string|number|undefined, v3:string|undefined, v4:string|undefined): Promise<void> {
    await this.postData({
      type: 'Q0017',
      data: {
        scene: scene && scene.toString(),
        v3: v3,
        v4: v4,
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
  public async addFriendByV3 ({ scene, v3, content, type }:{scene: string|undefined, content: string|undefined, type: number|undefined, v3:string|undefined, }): Promise<void> {
    await this.postData({
      type: 'Q0018',
      data: {
        scene: scene,
        v3: v3,
        content: content,
        type: type,
      },
    })

  }

  /**
   * 添加好友_通过v3
   * @param scene 来源 1=qq 3=微信号 6=单向添加 10和13=通讯录 14=群聊 15=手机号 17=名片 30=扫一扫
   * @param content 打招呼内容
   * @param wxid wxid
   */
  public async addFriendByWxid ({ scene, wxid, content }:{scene: string|undefined, content: string|undefined, wxid:string|undefined, }): Promise<void> {
    await this.postData({
      type: 'Q0019',
      data: {
        scene: scene,
        wxid: wxid,
        content: content,
      },
    })

  }

  /**
   * 查询陌生人信息
   * @param content 手机号或者QQ
   */
  public async searchStranger (content:string): Promise<ContactPayload> {
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
  public async inviteToGroup (groupId:string, contactId: string, type:number = 1): Promise<void> {
    await this.postData({
      type: 'Q0021',
      data: {
        wxid: groupId,
        objWxid: contactId,
        type: type,
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
        remark: remark,
      },
    })

  }

  /**
   * 修改群名
   * @param groupId 群id
   * @param name 群名
   */
  public async setGroupName (groupId: string, name: string|undefined): Promise<void> {
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
  public async sendContactCard (contactId: string, xml: string|any): Promise<void> {
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

}
export default Client
