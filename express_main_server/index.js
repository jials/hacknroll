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
    var residence = req.query.residence;
    if (!residence == 'rvrc') {
      var laundryRoom = req.query.room;
      res.send(washingMachineStatus[residence][laundryRoom]);
    } else if (residence == 'rvrc'){
      // RVRC only has one laundry room
      res.send(washingMachineStatus[residence]);
    } else {
      res.status(404).send('Not Found!');
    }
  }
})

app.post('/data', function(req, res) {
  var data = req.body
  res.send(data);
  var residence = _.findKey(data);
  var laundryRoom = _.findKey(data[residence]);
  washingMachineStatus[residence][laundryRoom] = data[residence][laundryRoom];
  console.log(JSON.stringify(washingMachineStatus));
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
