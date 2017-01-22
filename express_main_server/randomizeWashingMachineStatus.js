generateFourRandom = () => {
  const now = new Date().getTime();
  let result = []
  for (var i = 0; i < 4; i ++) {
    const rand = Math.floor((Math.random() * 10) + 1);
    if (Math.random() > 0.5) result.push(now + rand * 60 * 1000)
    else result.push(0)
  }
  return result;
}

var washingMachineStatus = require('./washingMachineStatus.json');

for (var college in washingMachineStatus) {
  if (college == 'rvrc' || college == 'utown residences') {
    washingMachineStatus[college].washer = generateFourRandom()
    washingMachineStatus[college].dryer = generateFourRandom()
  } else {
    for (var sublocation in washingMachineStatus[college]) {
      washingMachineStatus[college][sublocation].washer = generateFourRandom()
      washingMachineStatus[college][sublocation].dryer = generateFourRandom()
    }
  }
}

var fs = require('fs');
fs.writeFile("./washingMachineStatus.json", JSON.stringify(washingMachineStatus), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
