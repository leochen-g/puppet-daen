#!/usr/bin/env ts-node
import {
  VERSION,
  PuppetEngine,
}                       from 'wechaty-puppet-engine'

import assert from 'assert'

async function main () {
  if (VERSION === '0.0.0') {
    throw new Error('version should be set before publishing')
  }

  const puppet = new PuppetEngine()
  const version = puppet.version()
  assert(version, 'load version from puppet')
  // try {
  //   await bot.start()
  //   console.info(`Wechaty v${bot.version()} smoking test passed.`)
  // } catch (e) {
  //   console.error(e)
  //   // Error!
  //   return 1
  // } finally {
  //   await bot.stop()
  // }
  return 0
}

main()
  .then(process.exit)
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
