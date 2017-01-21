const Telegraf = require('telegraf')
const { Extra, Markup } = require('telegraf')
const request=require('request');
const app = new Telegraf(process.env.BOT_TOKEN)
const washingMachineStatus = require('./express_main_server/washingMachineStatus.json');

getSublocationForInput = (input, keywords) => {
  for (var index in keywords) {
    const keyword = keywords[index];
    if (input.indexOf(keyword) > -1) {
      const splitArr = input.split(' ');
      for (index in splitArr) {
        if (splitArr[index] == keyword) {
          if (+index + 1 < splitArr.length) return splitArr[+index + 1];
        } else if (splitArr[index].indexOf(keyword) > -1) {
          return splitArr[index].slice(keyword.length);
        }
      }
    }
  }
  return '';
}

getKeysForCollegeOrResidenceWithSublocation = (collegeOrResidence, sublocation, onSublocationMatched, onSublocationUnmatched) => {
  let keys = []
  for (var key in washingMachineStatus) {
    if (key.toLowerCase() === collegeOrResidence) {
      const levels = Object.keys(washingMachineStatus[key]);
      if (levels.indexOf(sublocation) > -1) {
        if (onSublocationMatched) onSublocationMatched();
      } else if (levels.length > 2) {
        if (onSublocationUnmatched) onSublocationUnmatched();
        for (i = 0; i < levels.length; i += 3) {
          keys.push(levels.slice(i, Math.min(i + 3, levels.length)));
        }
      } else {
        if (onSublocationUnmatched) onSublocationUnmatched();
        keys.push(levels)
      }
      break;
    }
  }
  return keys;
}

app.command('start', (ctx) => {
  console.log('start', ctx.from)
  ctx.reply('Welcome!')
})

// app.hears(/hi|hey|hello/i, (ctx) => {
//   ctx.reply('Hey there! Which residence are you staying in?', Markup
//    .keyboard([
//       ['PGP', 'RVRC'], // Row1 with 2 button
//       ['Cinnamon', 'Tembusu'], // Row2 with 2 button
//       ['CAPT', 'RC4', 'UTown Residences'] // Row3 with 3 button
//     ])
//    .oneTime()
//    .resize()
//    .extra()
//  )
// })

app.hears(/pgp/i, (ctx) => {
  const residence = ctx.match[0].toLowerCase();
  let sublocation = getSublocationForInput(ctx.match.input, ['r'])
  let keys = getKeysForCollegeOrResidenceWithSublocation(
    residence, 'r' + sublocation,
    () => { ctx.reply('DATA RETRIEVED FOR R') },
    () => {}
  )

  if (keys.length == 0) return;

  ctx.reply('Which residence are you interested in ' + residence.toUpperCase() + '?', Markup
   .keyboard(keys)
   .oneTime()
   .resize()
   .extra()
  )
})

app.hears(/tembusu|cinnamon|capt|rc4/i, (ctx) => {
  const input = ctx.match.input.toLowerCase();
  const college = ctx.match[0].toLowerCase();

  const level = getSublocationForInput(input, ['lvl', 'level']);
  const sublocation = "level " + level;
  const keys = getKeysForCollegeOrResidenceWithSublocation(
    college, sublocation,
    () => {
      getWashingMachineStatus(college, sublocation,
        () => {  },
        (body) => { ctx.reply(body) }
      )
    },
    () => { if (level != '') ctx.reply('Laundry is not available at that level.') }
  )

  if (keys.length == 0) return;

  ctx.reply('Which floor are you interested in ' + college.toUpperCase() + '?', Markup
   .keyboard(keys)
   .oneTime()
   .resize()
   .extra()
  )
})

app.hears(/rvrc|utown residences/i, (ctx) => {
  const residence = ctx.match[0].toLowerCase();
  for (var key in washingMachineStatus) {
    if (key.toLowerCase() === residence) {
      getWashingMachineStatus(residence, '',
        () => {  },
        (body) => { ctx.reply(body) }
      )
      break;
    }
  }
});

getWashingMachineStatus = (residence, room, onerror, onsuccess) => {
  console.log('http://localhost:3000/data?residence=' + escape(residence) + '&room=' + escape(room))
  request('http://localhost:3000/data?residence=' + escape(residence) + '&room=' + escape(room),
    (err,res,body) => {
      if (err) onerror();
      else if(res.statusCode == 200 ) onsuccess(body);
  });
}

app.on('sticker', (ctx) => ctx.reply('👍'))

app.startPolling()
