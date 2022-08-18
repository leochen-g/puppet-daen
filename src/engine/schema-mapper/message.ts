import type { MessagePayload, MsgSource, FromType } from '../../engine-schema.js'
import * as PUPPET from 'wechaty-puppet'
import { executeMessageParsers } from './message/mod.js'

type WechatyMessagePayload = PUPPET.payloads.Message & {
  msgSource?: MsgSource
  fromType?: FromType
  money?: string
  memo?: string
  transferid?: string
}

export async function engineMessageToWechaty (puppet: PUPPET.Puppet, engineMessage: MessagePayload): Promise<WechatyMessagePayload> {
  try {
    // set default value for MessagePayloadBase, other fields will be fulfilled or updated var MessageParers
    let ret: PUPPET.payloads.Message = {
      id: engineMessage.id,
      talkerId: engineMessage.fromWxid,
      text: engineMessage.msg,
      timestamp: engineMessage.timeStamp,
      type: PUPPET.types.Message.Unknown,
      msgSource: engineMessage.msgSource,
      money: engineMessage.money,
      memo: engineMessage.memo,
      transferid: engineMessage.transferid,
    } as WechatyMessagePayload

    ret = await executeMessageParsers(puppet, engineMessage, ret)

    // validate the return value
    if (!(ret.roomId || ret.listenerId)) {
      throw new Error('neither roomId nor listenerId')
    }

    return ret
  } catch (e) {
    return {} as PUPPET.payloads.Message
  }

}
