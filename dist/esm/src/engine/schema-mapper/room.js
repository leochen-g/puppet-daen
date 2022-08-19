export function engineRoomToWechaty(contact) {
    return {
        adminIdList: [],
        avatar: contact.avatar,
        id: contact.wxid,
        memberIdList: contact.chatroommemberList?.map(c => c.wxid) || [],
        ownerId: contact.ownerId,
        topic: contact.name,
    };
}
export function engineRoomMemberToWechaty(chatRoomMember) {
    return {
        avatar: chatRoomMember.avatar,
        id: chatRoomMember.wxid,
        inviterId: '',
        name: chatRoomMember.name,
        roomAlias: chatRoomMember.remark,
    };
}
export function chatRoomMemberToContact(chatRoomMember) {
    return chatRoomMember;
}
//# sourceMappingURL=room.js.map