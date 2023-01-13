import type * as PUPPET from 'wechaty-puppet'
import type { MessagePayload  } from '../../../engine-schema.js'
import { isIMRoomId, isRoomId } from '../../utils/is-type.js'
import type { MessageParser, MessageParserContext } from './message-parser.js'

async function roomMessageSentByOthers (engineMessage: MessagePayload, ret: PUPPET.payloads.Message) {
  if (isRoomId(engineMessage.fromWxid) || isIMRoomId(engineMessage.fromWxid)) {
    ret.roomId = engineMessage.fromWxid
    ret.talkerId = engineMessage.finalFromWxid || engineMessage.fromWxid
    ret.text = engineMessage.msg
    /**
     * separator of talkerId and content:
     *
     * text:    "wxid_xxxx:\nnihao"
     * appmsg:  "wxid_xxxx:\n<?xml version="1.0"?><msg><appmsg appid="" sdkver="0">..."
     * pat:     "19850419xxx@chatroom:\n<sysmsg type="pat"><pat><fromusername>xxx</fromusername><chatusername>19850419xxx@chatroom</chatusername><pattedusername>wxid_xxx</pattedusername>...<template><![CDATA["${vagase}" 拍了拍我]]></template></pat></sysmsg>"
     */
  }
}

async function roomMessageSentBySelf (engineMessage: MessagePayload, ret: PUPPET.payloads.Message) {
  if (isRoomId(engineMessage.fromWxid) || isIMRoomId(engineMessage.fromWxid)) {
    // room message sent by self
    ret.roomId = engineMessage.fromWxid
    ret.talkerId = engineMessage.finalFromWxid || engineMessage.fromWxid
    ret.text = engineMessage.msg
  }
}

/**
 * try to parse talkerId and content for generic room messages
 * @param engineMessage
 * @param ret
 * @param context
 */
export const roomParser: MessageParser = async (engineMessage: MessagePayload, ret: PUPPET.payloads.Message, context: MessageParserContext) => {
  await roomMessageSentByOthers(engineMessage, ret)
  await roomMessageSentBySelf(engineMessage, ret)

  if (ret.roomId) {
    context.isRoomMessage = true

    let mentionIdList: string[]
    /**
     *
     */
    if (!Array.isArray(engineMessage.atWxidList)) {
      engineMessage.atWxidList = []
    }
    if ((engineMessage.atWxidList.length === 1 && engineMessage.atWxidList[0] === 'announcement@all') || engineMessage.msg.includes('@所有人 ')) {
      const roomPayload = await context.puppet.roomPayload(ret.roomId)
      mentionIdList = roomPayload.memberIdList
    } else {
      mentionIdList = engineMessage.atWxidList
    }

    const room = ret as PUPPET.payloads.MessageRoom
    room.mentionIdList = mentionIdList
  }

  return ret
}
