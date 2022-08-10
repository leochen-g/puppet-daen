import type { MessagePayload } from '../../engine-schema.js'
import { WechatMessageType } from '../types.js'
import { xmlToJson } from '../utils/xml-to-json.js'
import type { PatMessagePayload, PatXmlSchema } from './sysmsg/message-pat.js'
import type { SysmsgTemplateMessagePayload, SysmsgTemplateXmlSchema } from './sysmsg/message-sysmsgtemplate.js'
import { parsePatMessagePayload } from './sysmsg/message-pat.js'
import { parseSysmsgTemplateMessagePayload } from './sysmsg/message-sysmsgtemplate.js'
import type { TodoMessagePayload, TodoXmlSchema } from './sysmsg/message-todo.js'
import { parseTodoMessagePayload } from './sysmsg/message-todo.js'
import type { RevokeMsgMessagePayload, RevokeMsgXmlSchema } from './sysmsg/message-revokemsg.js'
import { parseRevokeMsgMessagePayload } from './sysmsg/message-revokemsg.js'

interface SysmsgXmlSchema {
  sysmsg: {
    $: {
      type: string;
    },
    pat?: PatXmlSchema,
    sysmsgtemplate?: SysmsgTemplateXmlSchema,
    todo?: TodoXmlSchema,
    revokemsg?: RevokeMsgXmlSchema,
  };
}

type SysMsgType = 'pat' | 'sysmsgtemplate' | 'roomtoolstips' | 'revokemsg';
type SysMsgPayload = PatMessagePayload | SysmsgTemplateMessagePayload | TodoMessagePayload | RevokeMsgMessagePayload;

export interface SysmsgMessagePayload {
  type: SysMsgType;
  payload: SysMsgPayload
}

export async function parseSysmsgMessagePayload (message: MessagePayload): Promise<SysmsgMessagePayload | null> {
  if (message.msgType !== WechatMessageType.Sys) {
    return null
  }

  const content = message.msg.trim()
  const sysmsgIndex = content.indexOf('<sysmsg')
  if (sysmsgIndex === -1) {
    return null
  }

  const sysmsgXml: SysmsgXmlSchema = await xmlToJson(content.substring(sysmsgIndex))

  let payload : SysMsgPayload | undefined
  switch (sysmsgXml.sysmsg.$.type) {
    case 'pat':
      payload = await parsePatMessagePayload(sysmsgXml.sysmsg.pat!)
      break
    case 'sysmsgtemplate':
      payload = await parseSysmsgTemplateMessagePayload(sysmsgXml.sysmsg.sysmsgtemplate!)
      break
    case 'roomtoolstips':
      payload = await parseTodoMessagePayload(sysmsgXml.sysmsg.todo!)
      break
    case 'revokemsg':
      payload = await parseRevokeMsgMessagePayload(sysmsgXml.sysmsg.revokemsg!)
      break
  }

  if (payload) {
    return {
      payload,
      type: sysmsgXml.sysmsg.$.type as SysMsgType,
    }
  } else {
    return null
  }
}

export async function parseSysmsgPatMessagePayload (message: MessagePayload) : Promise<PatMessagePayload | null> {
  const sysmsgPayload = await parseSysmsgMessagePayload(message)
  if (!sysmsgPayload || sysmsgPayload.type !== 'pat') {
    return null
  }

  return sysmsgPayload.payload as PatMessagePayload
}

export async function parseSysmsgSysmsgTemplateMessagePayload (message: MessagePayload) : Promise<SysmsgTemplateMessagePayload | null> {
  const sysmsgPayload = await parseSysmsgMessagePayload(message)
  if (!sysmsgPayload || sysmsgPayload.type !== 'sysmsgtemplate') {
    return null
  }

  return sysmsgPayload.payload as SysmsgTemplateMessagePayload
}

export async function parseSysmsgTodoMessagePayload (message: MessagePayload) : Promise<TodoMessagePayload | null> {
  const sysmsgPayload = await parseSysmsgMessagePayload(message)
  if (!sysmsgPayload || sysmsgPayload.type !== 'roomtoolstips') {
    return null
  }

  return sysmsgPayload.payload as TodoMessagePayload
}

export async function parseSysmsgRevokeMsgMessagePayload (message: MessagePayload) : Promise<RevokeMsgMessagePayload | null> {
  const sysmsgPayload = await parseSysmsgMessagePayload(message)
  if (!sysmsgPayload || sysmsgPayload.type !== 'revokemsg') {
    return null
  }

  return sysmsgPayload.payload as RevokeMsgMessagePayload
}
