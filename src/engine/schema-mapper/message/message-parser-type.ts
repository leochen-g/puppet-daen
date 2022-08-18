import * as PUPPET from 'wechaty-puppet'
import type { MessagePayload  } from '../../../engine-schema.js'
import { WechatMessageType } from '../../types.js'
import { log } from 'wechaty-puppet'
import type { MessageParser, MessageParserContext } from './message-parser.js'
import { LOGPRE } from './message-parser.js'

const TypeMappings: { [key: number]: PUPPET.types.Message; } = {
  [WechatMessageType.Text]: PUPPET.types.Message.Text,
  [WechatMessageType.Image]: PUPPET.types.Message.Image,
  [WechatMessageType.Voice]: PUPPET.types.Message.Audio,
  [WechatMessageType.Emoticon]: PUPPET.types.Message.Emoticon,
  [WechatMessageType.App]: PUPPET.types.Message.Attachment,
  [WechatMessageType.File]: PUPPET.types.Message.Attachment,
  [WechatMessageType.Location]: PUPPET.types.Message.Location,
  [WechatMessageType.Video]: PUPPET.types.Message.Video,
  [WechatMessageType.Sys]: PUPPET.types.Message.Unknown,
  [WechatMessageType.ShareCard]: PUPPET.types.Message.Contact,
  [WechatMessageType.VoipMsg]: PUPPET.types.Message.Recalled,
  [WechatMessageType.SysTemplate]: PUPPET.types.Message.Recalled,
  [WechatMessageType.StatusNotify]: PUPPET.types.Message.Unknown,
  [WechatMessageType.SysNotice]: PUPPET.types.Message.Unknown,
  [WechatMessageType.RedEnvelope]: PUPPET.types.Message.RedEnvelope,
  [WechatMessageType.Transfer]: PUPPET.types.Message.Transfer,
}

export const typeParser: MessageParser = async (engineMessage: MessagePayload, ret: PUPPET.payloads.Message, _context: MessageParserContext) => {
  let type: PUPPET.types.Message | undefined
  const wechatMessageType = engineMessage.msgType

  if (!wechatMessageType) {
    type = PUPPET.types.Message.Unknown
    ret.type = type
    return ret
  }

  type = TypeMappings[wechatMessageType]

  if (!type) {
    log.verbose(LOGPRE, `unsupported type: ${JSON.stringify(engineMessage)}`)

    type = PUPPET.types.Message.Unknown
  }

  ret.type = type

  return ret
}
