import type { MessagePayload } from '../../engine-schema.js';
import type { PatMessagePayload } from './sysmsg/message-pat.js';
import type { SysmsgTemplateMessagePayload } from './sysmsg/message-sysmsgtemplate.js';
import type { TodoMessagePayload } from './sysmsg/message-todo.js';
import type { RevokeMsgMessagePayload } from './sysmsg/message-revokemsg.js';
declare type SysMsgType = 'pat' | 'sysmsgtemplate' | 'roomtoolstips' | 'revokemsg';
declare type SysMsgPayload = PatMessagePayload | SysmsgTemplateMessagePayload | TodoMessagePayload | RevokeMsgMessagePayload;
export interface SysmsgMessagePayload {
    type: SysMsgType;
    payload: SysMsgPayload;
}
export declare function parseSysmsgMessagePayload(message: MessagePayload): Promise<SysmsgMessagePayload | null>;
export declare function parseSysmsgPatMessagePayload(message: MessagePayload): Promise<PatMessagePayload | null>;
export declare function parseSysmsgSysmsgTemplateMessagePayload(message: MessagePayload): Promise<SysmsgTemplateMessagePayload | null>;
export declare function parseSysmsgTodoMessagePayload(message: MessagePayload): Promise<TodoMessagePayload | null>;
export declare function parseSysmsgRevokeMsgMessagePayload(message: MessagePayload): Promise<RevokeMsgMessagePayload | null>;
export {};
//# sourceMappingURL=message-sysmsg.d.ts.map