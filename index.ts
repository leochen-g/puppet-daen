import { WechatyBuilder } from 'wechaty'
import { PuppetDaen } from './src/mod.js'
const bot = WechatyBuilder.build({
  name: 'wechat-dice-bot', // generate xxxx.memory-card.json and save login data for the next login
  puppet: new PuppetDaen(),
});
// bot
//   .use(WechatyWebPanelPlugin({apiKey: 'e05752bb8ec1038e221a63bd35165cdec8177d3a',
//     apiSecret: 'd20f55ca1fc8b88f32313353ed8fcdc15fb7a279',}))
bot.on('message', async (msg) => {
  console.log('message', msg)
})

bot.start()
  .catch((e) => console.error(e))
