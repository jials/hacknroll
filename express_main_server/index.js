var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var washingMachineStatus = require('./washingMachineStatus.json');
var data = {}

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/data', function(req, res) {
  res.send(washingMachineStatus);
})

app.post('/data', function(req, res) {
  res.send(req.body);
  for (var field in req.body) {
    washingMachineStatus[field] = req.body[field];
  }
  console.log(JSON.stringify(washingMachineStatus));
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
