var express = require('express')
var app = express()

var data = {}

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/data', function(req, res) {
  res.send(data);
})

app.post('/data', function(req, res) {
  data = req.params;
  res.send('Received data:\n' + req.params);
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
