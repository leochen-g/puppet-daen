"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoomMemberToContact = exports.engineRoomMemberToWechaty = exports.engineRoomToWechaty = void 0;
function engineRoomToWechaty(contact) {
    return {
        adminIdList: [],
        avatar: contact.avatar,
        id: contact.wxid,
        memberIdList: contact.chatroommemberList?.map(c => c.wxid) || [],
        ownerId: contact.ownerId,
        topic: contact.name,
    };
}
exports.engineRoomToWechaty = engineRoomToWechaty;
function engineRoomMemberToWechaty(chatRoomMember) {
    return {
        avatar: chatRoomMember.avatar,
        id: chatRoomMember.wxid,
        inviterId: '',
        name: chatRoomMember.name,
        roomAlias: chatRoomMember.remark,
    };
}
exports.engineRoomMemberToWechaty = engineRoomMemberToWechaty;
function chatRoomMemberToContact(chatRoomMember) {
    return chatRoomMember;
}
exports.chatRoomMemberToContact = chatRoomMemberToContact;
//# sourceMappingURL=room.js.map