import type { ContactPayload } from '../../engine-schema.js'

import type * as PUPPET from 'wechaty-puppet'

export function engineRoomToWechaty (contact: ContactPayload): PUPPET.payloads.Room {
  return {
    adminIdList: [],
    avatar: contact.avatar,
    id: contact.wxid,
    memberIdList: contact.chatroommemberList?.map(c => c.wxid) || [],
    ownerId: contact.ownerId,
    topic: contact.name,
  }
}

export function engineRoomMemberToWechaty (chatRoomMember: ContactPayload): PUPPET.payloads.RoomMember {
  return {
    avatar: chatRoomMember.avatar,
    id: chatRoomMember.wxid,
    inviterId: '',
    name: chatRoomMember.name,
    roomAlias: chatRoomMember.remark,
  }
}

export function chatRoomMemberToContact (chatRoomMember: ContactPayload): ContactPayload {
  return chatRoomMember
}
