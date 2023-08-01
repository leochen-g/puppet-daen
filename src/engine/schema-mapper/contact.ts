import * as PUPPET from 'wechaty-puppet'
import { isContactOfficialId } from '../utils/is-type.js'
import type { ContactPayload } from '../../engine-schema.js'

export function engineContactToWechaty (contact?: ContactPayload): PUPPET.payloads.Contact {
  if (contact) {
    return {
      alias: contact.remark, // 备注
      avatar: contact.avatar, // 头像
      city: contact.city, // 城市
      gender: contact.sex, // 性别
      id: contact.wxid, // wxid
      name: contact.name, // 昵称
      friend: !!contact.isFriend, // 是否是好友
      phone: [],
      province: contact.province,
      signature: contact.sign, // 签名
      type: isContactOfficialId(contact.wxid) ? PUPPET.types.Contact.Official : PUPPET.types.Contact.Individual,
      weixin: contact.wxNum,
    }
  } else {
    return {
      alias: '', // 备注
      avatar: '', // 头像
      city: '', // 城市
      gender: 0, // 性别
      id: '', // wxid
      name: '', // 昵称
      friend: false, // 是否是好友
      phone: [],
      province: '',
      signature: '', // 签名
      type: PUPPET.types.Contact.Individual,
      weixin: '',
    }
  }
}
