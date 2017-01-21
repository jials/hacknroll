const Telegraf = require('telegraf')
const { Extra, Markup, memorySession } = require('telegraf')
const request=require('request');
const app = new Telegraf(process.env.BOT_TOKEN)
const washingMachineStatus = require('./express_main_server/washingMachineStatus.json');

const WAIT_TIME_WASHER = 45;
const WAIT_TIME_DRYER = 40;

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

app.use(memorySession())

app.command('start', (ctx) => {
  console.log('start', ctx.from)
  ctx.session.residenceOrCollege = '';
  ctx.session.sublocation = '';
  ctx.reply('Welcome!');
})

app.hears(/hi|hey|hello/i, (ctx) => {
  ctx.session.residenceOrCollege = '';
  ctx.session.sublocation = '';
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
  const residence = ctx.match[0].toLowerCase();
  ctx.session.residenceOrCollege = residence;
  let sublocation = getSublocationForInput(ctx.match.input, ['r'])
  ctx.session.sublocation = 'r' + sublocation;
  let keys = getKeysForCollegeOrResidenceWithSublocation(
    residence, 'r' + sublocation,
    () => {
      getWashingMachineStatus(residence, 'r' + sublocation,
        () => {  },
        (body) => { ctx.reply(getWashingMachineStatusSummaryMessage(body, ctx.session.residenceOrCollege, ctx.session.sublocation)) }
      )
    },
    () => { if (sublocation != '') ctx.reply('There is no R' + sublocation + ' in ' + residence.toUpperCase()) }
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
  ctx.session.residenceOrCollege = college;

  const level = getSublocationForInput(input, ['lvl', 'level']);
  const sublocation = "level " + level;
  ctx.session.sublocation = sublocation;
  const keys = getKeysForCollegeOrResidenceWithSublocation(
    college, sublocation,
    () => {
      getWashingMachineStatus(college, sublocation,
        () => {  },
        (body) => { ctx.reply(getWashingMachineStatusSummaryMessage(body, ctx.session.residenceOrCollege, ctx.session.sublocation)) }
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
  ctx.session.residenceOrCollege = residence;
  ctx.session.sublocation = '';
  for (var key in washingMachineStatus) {
    if (key.toLowerCase() === residence) {
      getWashingMachineStatus(residence, '',
        () => {  },
        (body) => { ctx.reply(getWashingMachineStatusSummaryMessage(body, ctx.session.residenceOrCollege, ctx.session.sublocation)) }
      )
      break;
    }
  }
});

app.hears(/r[1-6]/i, (ctx)=>{
  const residence = ctx.session.residenceOrCollege || "";
  if (residence.toLowerCase() != 'pgp') return;
  const sublocation = ctx.match[0].toLowerCase();
  ctx.session.sublocation = sublocation;
  getWashingMachineStatus(residence, sublocation,
    () => { ctx.reply('I can\'t find that residence') },
    (body) => { ctx.reply(getWashingMachineStatusSummaryMessage(body, ctx.session.residenceOrCollege, ctx.session.sublocation)) }
  )
})

app.hears(/lvl[0-9]{1,2}|level[0-9]{1,2}|lvl [0-9]{1,2}|level [0-9]{1,2}/i, (ctx) => {
  const college = ctx.session.residenceOrCollege || "";
  if (['pgp', 'rvrc', 'utown residence'].indexOf(college) > -1) return;
  const sublocation = ctx.match[0].toLowerCase();
  ctx.session.sublocation = sublocation;
  getWashingMachineStatus(college, sublocation,
    () => { ctx.reply('I can\'t find any laundry at that level') },
    (body) => { ctx.reply(getWashingMachineStatusSummaryMessage(body, ctx.session.residenceOrCollege, ctx.session.sublocation)) }
  )
})

getEstimatedMinutes = (timestamp, type) => {
  const date = new Date(timestamp);
  const now = new Date().getTime();
  if (type == 'washer') {
    return Math.round(WAIT_TIME_WASHER - (now - date) / 1000 / 60) + "minutes";
  } else {
    return Math.round(WAIT_TIME_DRYER - (now - date) / 1000 / 60) + "minutes";
  }
}

getWashingMachineStatusSummaryMessage = (body, residenceOrCollege, sublocation) => {
  const info = JSON.parse(body);
  const washers = info.washer;
  const dryers = info.dryer;
  let minWasherTime = Number.MAX_VALUE;
  let minDryerTime = Number.MAX_VALUE;
  let washerCount = 0;
  let dryerCount = 0;
  for (var index in washers) {
    if (washers[index] == 0) washerCount ++;
    else if (washers[index] < minWasherTime) minWasherTime = +washers[index];
  }

  for (var index in dryers) {
    if (dryers[index] == 0) dryerCount ++;
    else if (dryers[index] < minDryerTime) minDryerTime = +dryers[index];
  }

  let string = 'Washing & Dryer Machine @ ' + residenceOrCollege.toUpperCase() + ' ' + sublocation.toUpperCase() + '\n';
  if (washerCount > 0) string += washerCount + ' washers available\n';
  else string += 'The next washer available in ' + getEstimatedMinutes(minWasherTime, ' washer') + '\n';

  if (dryerCount > 0) string += dryerCount + ' dryers available\n';
  else string += 'The next dryer available in ' + getEstimatedMinutes(minDryerTime, ' dryer') + '\n';

  return string
}

getWashingMachineStatus = (residence, room, onerror, onsuccess) => {
  console.log('http://localhost:3000/data?residence=' + escape(residence) + '&room=' + escape(room))
  request('http://localhost:3000/data?residence=' + escape(residence) + '&room=' + escape(room),
    (err,res,body) => {
      if (err) onerror();
      else if(res.statusCode == 200 ) onsuccess(body);
      else {
        // console.log(res)
      }
  });
}

app.on('sticker', (ctx) => ctx.reply('👍'))

app.startPolling()
