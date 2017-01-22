var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var washingMachineStatus = require('./washingMachineStatus.json');
var data = {}
var _ = require('lodash');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/data', function(req, res) {
  // Sample query: /data?residence=PGP&room=R1
  if (!_.isEmpty(req.query)) {
    var residence = req.query.residence.toLowerCase();
    if (residence != 'rvrc' && residence != 'utown residences') {
      var laundryRoom = req.query.room.toLowerCase();
      console.log(req.query.room);
      res.send(washingMachineStatus[residence][laundryRoom]);
    } else if (residence == 'rvrc' || residence == 'utown residences') {
      console.log('2')
      // RVRC only has one laundry room
      res.send(washingMachineStatus[residence]);
    } else {
      console.log('3')
      res.status(404).send('Not Found!');
    }
  } else {
    // return the whole array if no filtering is requested
    res.send(washingMachineStatus);
  }
})

app.post('/data', function(req, res) {
  var data = req.body
//  console.log(data);
  res.send(data);
  var residence = _.findKey(data).toLowerCase();
//  console.log(residence);
//  console.log(data[residence]);
  if (residence != "rvrc" && residence != "utown residences") {
      var laundryRoom = _.findKey(data[residence])
//      console.log(laundryRoom);
      washingMachineStatus[residence][laundryRoom] = data[residence][laundryRoom];
  } else {
    washingMachineStatus[residence] = data[residence];
  }
  console.log(JSON.stringify(washingMachineStatus));
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
