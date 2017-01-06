var Stomp = require('stomp-client');
var stomp = require('stompy');
var JSONPath = require('jsonpath-plus');
var Q = require('q')
var subscriptions = {};
var publishers = {};
var context = {};

function getDestination(destination, destinationType) {
    return '/' + destinationType + '/' + destination;
}

function publishMessage(host, port, destination, destinationType, message) {
  var id = destination + ':' + destinationType;
  var publisher = publishers[id] = publishers[id] || stomp.createClient(
            {
                host: host,
                port: port,
                retryOnClosed: true,
            });

  publisher.publish('/' + destinationType + '/' + destination, message);
}

function subscribe(host, port, destination, destinationType) {
	var dest = getDestination(destination, destinationType);
	var subscription = subscriptions[destination] = subscriptions[destination] || new Stomp(host, port);

  msgctx = context.__STOMP__ = context.__STOMP__ || {}
  msgctx[destination] = msgctx[destination] || [];
  subscription.connect(function (sessionId) {
      subscription.subscribe(dest, function (body, headers) {
          var msg = {
              body: body,
              headers: headers
          };
          msgctx[destination].push(msg);
      });
  });
}

function unsubscribe(destination, destinationType) {
  var dest = getDestination(destination, destinationType);

	subscriptions[topic].unsubscribe(dest);
	subscriptions[topic].disconnect();
	subscriptions[topic] = null;
}

function getMessages(destination) {
  return context.__STOMP__[destination];
}


function pop(destination, callback) {
    result = context.__STOMP__[destination].pop();
    
    if(result) {
        callback(result);
    } else {
        Q.delay(2000).done(function() { popMessage(destination, callback) });
    }
}

function getMsgCount(destination) {
    return context.__STOMP__[destination].length;
}

function getMessage(destination, path, value) {
    var found = false;
    context.__STOMP__[destination].forEach(function (msg) {
        var json = JSON.parse(msg.body);
        var result = getMessageAtIdentifier(json, path, value);

        expect(result).not.toBeNull("No message found for the identifier "+ path + "[" + value + "]");

        return result;
    });
}

function getMessageAtIdentifier(json, path, value) {
    var result = JSONPath({json: json, path: path});
    return result.length > 0 && result[0] == value ? result[0] : null;
}

function flush(destination) {
    context.__STOMP__[destination] = [];
}

module.exports = {
    'getMessageAtIdentifier' : getMessageAtIdentifier,
    'getMessage' : getMessage,
    'getMsgCount' : getMsgCount,
    'subscribe' : subscribe,
    'unsubscribe' : unsubscribe,
    'getMessages' : getMessages,
    'flush' : flush,
    'publishMessage' : publishMessage,
    'pop' : pop
};
