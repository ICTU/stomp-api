var StompLib = require('./stomp-lib.js')
var express = require('express')
var bodyParser = require('body-parser')
var app = express()

app.use(bodyParser.json())

app.put('/queues/subscriptions', function(req, res) {
  StompLib.subscribe(process.env.host, process.env.port, req.body.queue, 'queue');
  return res.json(req.body);
})

app.put('/topics/subscriptions', function(req, res) {
  StompLib.subscribe(process.env.host, process.env.port, req.body.topic, 'topic');
  return res.json(req.body);
})

app.put('/queues/:queue', function (req, res) {
  StompLib.publishMessageToHost(process.env.host, process.env.port, req.params.queue, 'queue', req.body.message);
  return res.json(req.body);
})

app.put('/topics/:topic', function (req, res) {
  StompLib.publishMessageToHost(process.env.host, process.env.port, req.params.topic, 'topic', req.body.message);
  return res.json(req.body);
})

app.get('/queues/:queue', function (req, res) {
  return res.json(getMessages(req.params.queue));
})

app.get('/topics/:topic', function (req, res) {
  return res.json(getMessages(req.params.topic));
})

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})

function getMessages(destination) {
  var messages = StompLib.getMessages(destination);
  StompLib.flush(destination);
  return messages;
}
