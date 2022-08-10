import type { ContactPayload } from '../../engine-schema.js'

import type * as PUPPET from 'wechaty-puppet'

export function engineRoomToWechaty (contact: ContactPayload): PUPPET.payloads.Room {
  return {
    adminIdList: [],
    avatar: contact.avatarMinUrl || contact.avatarMaxUrl,
    id: contact.wxid,
    memberIdList: contact.chatroommemberList?.map(c => c.wxid) || [],
    ownerId: contact.ownerId,
    topic: contact.nick,
  }
}

export function engineRoomMemberToWechaty (chatRoomMember: ContactPayload): PUPPET.payloads.RoomMember {
  return {
    avatar: chatRoomMember.avatarUrl || chatRoomMember.avatarMinUrl || chatRoomMember.avatarMaxUrl || '',
    id: chatRoomMember.wxid,
    inviterId: '',
    name: chatRoomMember.nick,
    roomAlias: chatRoomMember.remark,
  }
}

export function chatRoomMemberToContact (chatRoomMember: ContactPayload): ContactPayload {
  return chatRoomMember
}
