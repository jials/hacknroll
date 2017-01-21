const Telegraf = require('telegraf')
const { Extra, Markup } = require('telegraf')
const request=require('request');
const app = new Telegraf(process.env.BOT_TOKEN)

app.command('start', (ctx) => {
  console.log('start', ctx.from)
  ctx.reply('Welcome!')
})

app.hears((/hi|hey|hello/i), (ctx) => {
  ctx.reply('Hey there! Which residence are you staying in?', Markup
   .keyboard([
      ['PGP', 'RVRC'], // Row1 with 2 button
      ['Cinnamon', 'Tembusu'], // Row2 with 2 button
      ['CAPT', 'RC4', 'UTown Residences'] // Row3 with 3 button
    ])
   .oneTime()
   .resize()
   .extra()
 )
})

app.hears(/pgp/i, (ctx) => {
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

app.hears('abcd', (ctx) => {
  request('http://localhost:3000/data', (err,res,body) => {
    if (err) ctx.reply('error');
    else if(res.statusCode == 200 ) ctx.reply(body);
  });
})

app.on('sticker', (ctx) => ctx.reply('👍'))

app.startPolling()
