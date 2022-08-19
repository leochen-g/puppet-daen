import type * as PUPPET from 'wechaty-puppet';
import type { MessagePayload } from '../../../engine-schema.js';
import type { AppMessagePayload } from '../../messages/message-appmsg.js';
/**
 * Add customized message parser context info here
 */
export declare type MessageParserContext = {
    puppet: PUPPET.Puppet;
    isRoomMessage: boolean;
    appMessagePayload?: AppMessagePayload;
};
export declare type MessageParser = (padLocalMessage: MessagePayload, ret: PUPPET.payloads.Message, context: MessageParserContext) => Promise<PUPPET.payloads.Message>;
export declare function addMessageParser(parser: MessageParser): void;
export declare function executeMessageParsers(puppet: PUPPET.Puppet, engineMessage: MessagePayload, ret: PUPPET.payloads.Message): Promise<PUPPET.payloads.Message>;
export declare const LOGPRE = "message-parser";
//# sourceMappingURL=message-parser.d.ts.map