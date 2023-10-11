# WECHATY-PUPPET-ENGINE

[![NPM Version](https://badge.fury.io/js/wechaty-puppet-engine.svg)](https://www.npmjs.com/package/wechaty-puppet-engine)
[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-Wechaty-brightgreen.svg)](https://github.com/wechaty/wechaty)
[![Powered by padlocal-client-ts](https://img.shields.io/badge/Powered%20By-daen--client--ts-brightgreen)](https://github.com/leochen-g/daen-client-ts)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)
![Stage](https://img.shields.io/badge/Stage-beta-yellow)

## WECHATY PUPPET YOUTH STAR

wechaty-puppet-engine is a local puppet engine for Wechaty:

- If you are a user of Windows,You can use this puppet to implement your chatbot.
- It's a completely free service and doesn't need token.
- It's has adapted a hook client： [daen-client-ts](https://github.com/leochen-g/daen-client-ts)

## TL;DR

1. Getting Started with Wechaty: <https://wechaty.js.org/docs/getting-started/>

## GETTING STARTED

- STEP 1: Install wechat client in your Windows computer.
- STEP 2: Inject dll file using dll injector.
- STEP 3: [Getting Started with TypeScript/JavaScript (RECOMMENDED)](https://github.com/leochen-g/wechaty-puppet-engine/wiki/Getting-Started-with-TypeScript-Javascript)

## REFERENCE

- [API 使用文档 (TypeScript/JavaScript)](https://github.com/leochen-g/puppet-engine/wiki/Getting-Started-with-TypeScript-Javascript)
- [常见问题列表](https://github.com/leochen-g/puppet-engine/wiki/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98%E5%88%97%E8%A1%A8)

## PUPPET COMPARISON

Engine is another powerful puppet.

Puppet|Engine👍
:---|:---:
支持账号|个人微信
**<消息>**|
收发文本|✅
收发个人名片|❌
收发图文链接|✅
发送图片、文件|✅
接收图片、文件|✅
发送视频（文件形式发送）|✅
接收视频|✅
发送小程序|✅
接收动图|❌
发送动图|❌
接收语音消息|❌
发送语音消息|❌
转发文本|✅
转发图片|✅
转发图文链接|✅
转发音频|❌
转发视频|❌
转发文件|✅
转发动图|❌
转发小程序|✅
接收转账|✅
确认转账|✅
发送音乐链接|✅
**<群组>**|
创建群聊|❌
设置群公告|✅
获取群公告|❌
群二维码|❌
拉人进群|✅
踢人出群|❌
退出群聊（取决于使用的client-ts）|✅
改群名称|✅
入群事件|✅
离群事件（优化中）|✅
群名称变更事件|✅
@群成员|✅
群列表|✅
群成员列表|✅
群详情|✅
**<联系人>**|
修改备注|✅
添加好友|✅
自动通过好友|✅
好友列表|✅
好友详情|✅
**<其他>**|
hook事件|✅
登录事件|✅
扫码状态|❌
依赖协议|Windows

> [Wechaty puppet compatibility](https://github.com/wechaty/wechaty-puppet/wiki/Compatibility)

## CLIENT-TS

This project is a puppet engine. So it can adapt to multiple clients.At present, a hook client has been built in, ant its name is daen-client-ts.

### use daen-client-ts

Daen-client-ts is default client.

1. You need to download the [WeChatSetup-v3.6.0.18.exe](https://github.com/leochen-g/puppet-engine/releases)
2. Go to the open source project [DaenWxHook](https://gitee.com/daenmax/pc-wechat-hook-http-api/tree/master/DaenWxHook) to download dll and dll injector or use [releases](https://github.com/leochen-g/puppet-engine/releases) file.

## HISTORY

v1.0.1 (Aug 22, 2022)
update README

v1.0.1 (Aug 19, 2022)
Initial version

## Author

[@Leo_chen](https://github.com/leochen-g)

## License

Apache-2.0
