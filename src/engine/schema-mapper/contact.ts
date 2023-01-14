import * as PUPPET from 'wechaty-puppet'
import { isContactOfficialId } from '../utils/is-type.js'
import type { ContactPayload } from '../../engine-schema.js'

export function engineContactToWechaty (contact: ContactPayload): PUPPET.payloads.Contact {
  return {
    alias: contact.remark, // 备注
    avatar: contact.avatar, // 头像
    city: contact.city, // 城市
    gender: contact.sex, // 性别
    id: contact.wxid, // wxid
    name: contact.name, // 昵称
    friend: true,
    phone: [],
    province: contact.province,
    signature: contact.sign, // 签名
    type: isContactOfficialId(contact.wxid) ? PUPPET.types.Contact.Official : PUPPET.types.Contact.Individual,
    weixin: contact.wxNum,
  }
}
