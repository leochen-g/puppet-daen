import type { ContactPayload } from '../../engine-schema.js';
import type * as PUPPET from 'wechaty-puppet';
export declare function engineRoomToWechaty(contact: ContactPayload): PUPPET.payloads.Room;
export declare function engineRoomMemberToWechaty(chatRoomMember: ContactPayload): PUPPET.payloads.RoomMember;
export declare function chatRoomMemberToContact(chatRoomMember: ContactPayload): ContactPayload;
//# sourceMappingURL=room.d.ts.map