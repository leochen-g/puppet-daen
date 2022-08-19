import type * as PUPPET from 'wechaty-puppet';
export interface RevokeMsgXmlSchema {
    session: string;
    msgid: string;
    newmsgid: string;
    replacemsg: string;
}
export declare type RevokeMsgType = 'You' | 'Other';
export interface RevokeMsgMessagePayload {
    content: string;
    operatorNickName?: string;
    originalMessageId: string;
    session: string;
    type: RevokeMsgType;
}
export declare function parseRevokeMsgMessagePayload(revokeMsgXmlSchema: RevokeMsgXmlSchema): Promise<RevokeMsgMessagePayload>;
export declare function getRevokeOriginalMessage(puppet: PUPPET.Puppet, revokemsgPayload: RevokeMsgMessagePayload): Promise<PUPPET.payloads.Message | null>;
export declare function getRevokeOperatorIdForRoomMessage(puppet: PUPPET.Puppet, revokemsgPayload: RevokeMsgMessagePayload): Promise<string | null>;
//# sourceMappingURL=message-revokemsg.d.ts.map