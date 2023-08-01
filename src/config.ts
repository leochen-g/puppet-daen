import {
  log,
}                  from 'wechaty-puppet'

import { packageJson } from './package-json.js'

const VERSION = packageJson.version || '0.0.0'

const MEMORY_SLOT = 'PUPPET_ENGINE'

export {
  VERSION,
  log,
  MEMORY_SLOT,
}
