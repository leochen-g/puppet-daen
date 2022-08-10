import type { MessagePayload } from '../../engine-schema.js'
import * as PUPPET from 'wechaty-puppet'
import { executeMessageParsers } from './message/mod.js'

export async function engineMessageToWechaty (puppet: PUPPET.Puppet, engineMessage: MessagePayload): Promise<PUPPET.payloads.Message> {
  // set default value for MessagePayloadBase, other fields will be fulfilled or updated var MessageParers
  let ret: PUPPET.payloads.Message = {
    id: engineMessage.id,
    talkerId: engineMessage.fromWxid,
    text: engineMessage.msg,
    timestamp: engineMessage.timeStamp,
    type: PUPPET.types.Message.Unknown,
  } as PUPPET.payloads.Message

  ret = await executeMessageParsers(puppet, engineMessage, ret)

  // validate the return value
  if (!(ret.roomId || ret.listenerId)) {
    throw new Error('neither roomId nor listenerId')
  }

  return ret
}
