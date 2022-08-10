import type * as PUPPET from 'wechaty-puppet'
import type { MessagePayload } from '../../engine-schema.js'
import type { EventPayload } from './event.js'

export default async (_puppet: PUPPET.Puppet, message: MessagePayload): Promise<EventPayload> => {
  return message
}
