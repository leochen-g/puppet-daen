import { WechatyBuilder } from 'wechaty'
import { FileBox } from 'file-box'
import { PuppetEngine } from './src/mod.js'
const bot = WechatyBuilder.build({
  name: 'wechat-dice-bot', // generate xxxx.memory-card.json and save login data for the next login
  puppet: new PuppetEngine({
    runLocal: false,
    httpServer: 'http://10.10.10.15:8055',
  }),
});
// bot
//   .use(WechatyWebPanelPlugin({apiKey: 'e05752bb8ec1038e221a63bd35165cdec8177d3a',
//     apiSecret: 'd20f55ca1fc8b88f32313353ed8fcdc15fb7a279',}))
bot.on('message', async (msg) => {
  console.log('message', msg.text())
  const contact = msg.talker()
  const room = msg.room() // 是否为群消息
  if(msg.text() === '图片') {
    const file = FileBox.fromUrl('https://img.aibotk.com/aibotk/public/yq3wWdBL0BnJV4Z1_sh.jpeg')
    console.log('in', file)
    await contact.say(file)
  } else if(msg.text() === '文字') {
   await contact.say("你好")
  } else if(msg.text() === '文件') {
    const file = FileBox.fromUrl('https://transfer.sh/naRe6G/9a8d2830c0c548b70f24de5b0bf6e9fd_681899382309_v_1660206582323327.mp4')
    await contact.say(file)
  } else if(msg.text() === 'h5') {
    const urlCard = new bot.UrlLink({
      title: "Hello World! 你好世界！",
      description: "This is description。描述可中文",
      thumbnailUrl: "https://img.aibotk.com/aibotk/public/yq3wWdBL0BnJV4Z1_sh.jpeg",
      url: "http://wechat.aibotk.com/material/file",
    });
    if(room) {
      room.say(urlCard)
    } else {
      await contact.say(urlCard)
    }
  } else if(msg.text() === '小程序') {
    const mini = new bot.MiniProgram({
      description: "美团打车",
      title: "美团打车",
      pagePath: "pages/index/index2.html?showCarKnowledge=false&source=xcx_sy2021",
      thumbUrl: "https://img.aibotk.com/aibotk/public/yq3wWdBL0BnJV4Z1_meiri.jpeg",
      username: "gh_b86a530798ae"
    })
    if(room) {
      await room.say(mini)
    }else {
      await contact.say(mini)
    }
  } else if(msg.text() === '音乐') {
    const music = await bot.Post.builder()
      .add('music')
      .add('幸福了 然后呢')
      .add('A-Lin')
      .add('wx5aa333606550dfd5')
      .add('http://isure6.stream.qqmusic.qq.com/C400002QTAVi3WShQg.m4a?fromtag=30006&guid=2000000006&uin=0&vkey=5F8F57E2B07E3D952EB4FAAE0D2A965CBD055BA8D822EAB3D9F41871F5EAB464D68095C572917296B9934F5DE6722A52020E562793E5921A')
      .add('http://isure6.stream.qqmusic.qq.com/C400002QTAVi3WShQg.m4a?fromtag=30006&guid=2000000006&uin=0&vkey=5F8F57E2B07E3D952EB4FAAE0D2A965CBD055BA8D822EAB3D9F41871F5EAB464D68095C572917296B9934F5DE6722A52020E562793E5921A')
      .add('https://img.aibotk.com/aibotk/public/yq3wWdBL0BnJV4Z1_WechatIMG3550.jpeg')
      .build()
    if(room) {
      await room.say(music)
    }else {
      await contact.say(music)
    }
  } else if(msg.text() === '进群') {
    const room = await bot.Room.find({ topic: '来说a'})
    if(room) {
      room.add(contact)
    }
  }
  console.log('msg.type()', msg.type())
  if(msg.type() === 6 || msg.type() === 1) {
    const res = await msg.toFileBox()
    console.log('res', res)
    await res.toFile('./' + res.name)
  }
  if(msg.type() === 11) {
    const money = msg?.money
    const transferId =  msg?.transferid
    const desc =  msg?.memo
    const msgType = msg?.msgSource
    console.log('msgType', msgType)
    console.log(`收到转账:${money}\n转账id:${transferId}\n备注：${desc}`)
    const music = await bot.Post.builder()
      .add('transfer')
      .add(transferId)
      .build()
    if(room) {
      await room.say(music)
    }else {
      await contact.say(music)
    }
  }
})
bot.on('friendship', async (friendship)=> {
  let name = friendship.contact().name()
  let hello = friendship.hello()
  let logMsg = name + '，发送了好友请求'
  console.log(logMsg, hello)
  console.log('type', friendship.type())
  await friendship.accept()
})
bot.on('room-join', async (room, inviteeList, inviter, date)=> {
  const nameList = inviteeList.map((c) => c.name()).join(',')
  const roomName = await room.topic()
  console.log(`群名： ${roomName} ，加入新成员： ${nameList}, 邀请人： ${inviter}`)
  room.say(`欢迎进群`, ...inviteeList)
})
bot.on('room-leave', async (room, leaverList, remover, date)=> {
  const nameList = leaverList.map((c) => c.name()).join(',')
  console.log(`Room ${await room.topic()} lost member ${nameList}, the remover is: ${remover}`)
})

bot.on('room-topic', (room, newTopic, oldTopic, changer, date)=> {
  console.log(`【${oldTopic}】群名更新为：${newTopic}`)
})
bot.start()
  .catch((e) => console.error(e))
