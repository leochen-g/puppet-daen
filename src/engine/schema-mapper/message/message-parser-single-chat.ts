import type * as PUPPET from 'wechaty-puppet'
import type { MessagePayload  } from '../../../engine-schema.js'
import type { MessageParser, MessageParserContext } from './message-parser.js'

export const singleChatParser: MessageParser = async (engineMessage: MessagePayload, ret: PUPPET.payloads.Message, context: MessageParserContext) => {
  if (!context.isRoomMessage) {
    ret.talkerId = engineMessage.fromWxid
    ret.listenerId = engineMessage.listenerId
  }

  return ret
}
