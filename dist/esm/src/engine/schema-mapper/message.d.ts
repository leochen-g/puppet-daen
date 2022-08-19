import type { MessagePayload, MsgSource, FromType } from '../../engine-schema.js';
import * as PUPPET from 'wechaty-puppet';
declare type WechatyMessagePayload = PUPPET.payloads.Message & {
    msgSource?: MsgSource;
    fromType?: FromType;
    money?: string;
    memo?: string;
    transferid?: string;
};
export declare function engineMessageToWechaty(puppet: PUPPET.Puppet, engineMessage: MessagePayload): Promise<WechatyMessagePayload>;
export {};
//# sourceMappingURL=message.d.ts.map