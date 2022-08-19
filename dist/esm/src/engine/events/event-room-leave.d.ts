import type { MessagePayload } from '../../engine-schema.js';
import type * as PUPPET from 'wechaty-puppet';
import type { EventPayload } from './event.js';
export declare function removeRoomLeaveDebounce(roomId: string, removeeId: string): void;
export declare function isRoomLeaveDebouncing(roomId: string, removeeId: string): boolean;
declare const _default: (puppet: PUPPET.Puppet, message: MessagePayload) => Promise<EventPayload>;
export default _default;
//# sourceMappingURL=event-room-leave.d.ts.map