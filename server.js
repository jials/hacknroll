const Telegraf = require('telegraf')
const { Extra, Markup } = require('telegraf')

const app = new Telegraf(process.env.BOT_TOKEN)

app.command('start', (ctx) => {
  console.log('start', ctx.from)
  ctx.reply('Welcome!')
})

app.hears('hi', (ctx) => {
  ctx.reply('Hey there! Which residence are you staying in?', Markup
   .keyboard([
     'PGP',
     'Tembusu',
     'Cinnamon'
   ])
   .oneTime()
   .resize()
   .extra()
 )
})

app.hears('PGP', (ctx) => {
  ctx.reply('Which residence are you interested in?', Markup
   .keyboard([
     ['1', '2', '3'],
     ['4', '5', '6']
   ])
   .oneTime()
   .resize()
   .extra()
  )
})

app.on('sticker', (ctx) => ctx.reply('👍'))

app.startPolling()
