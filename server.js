const Telegraf = require('telegraf')
const { Extra, Markup } = require('telegraf')
const request=require('request');
const app = new Telegraf(process.env.BOT_TOKEN)
const washingMachineStatus = require('./express_main_server/washingMachineStatus.json');

app.command('start', (ctx) => {
  console.log('start', ctx.from)
  ctx.reply('Welcome!')
})

app.hears(/hi|hey|hello/i, (ctx) => {
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

app.hears(/tembusu|cinnamon|capt|rc4/i, (ctx) => {
  const college = ctx.match[0]
  let keys = []
  for (var key in washingMachineStatus) {
    if (key.toLowerCase() === college) {
      const levels = Object.keys(washingMachineStatus[key]);
      if (levels.length > 2) {
        for (i = 0; i < levels.length; i += 3) {
          keys.push(levels.slice(i, Math.min(i + 3, levels.length)));
        }
      } else {
        keys.push(levels)
      }
      break;
    }
  }

  ctx.reply('Which floor are you interested in?', Markup
   .keyboard(keys)
   .oneTime()
   .resize()
   .extra()
  )
})

app.hears(/rvrc|utown residences/i, (ctx) => {
  const residence = ctx.match[0]
  for (var key in washingMachineStatus) {
    if (key.toLowerCase() === residence) {
      //TODO call API
      const washers = washingMachineStatus[key]["Washer"];
      const dryers = washingMachineStatus[key]["Dryer"];
      ctx.reply(JSON.stringify(washers) + JSON.stringify(dryers))
      break;
    }
  }
});

app.hears('abcd', (ctx) => {
  request('http://localhost:3000/data', (err,res,body) => {
    if (err) ctx.reply('error');
    else if(res.statusCode == 200 ) ctx.reply(body);
  });
})

app.on('sticker', (ctx) => ctx.reply('👍'))

app.startPolling()
