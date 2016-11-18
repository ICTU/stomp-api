var Stomp = require('stomp-client');
var stomp = require('stompy');
var JSONPath = require('jsonpath-plus');
var clients = {};
var publishClients = {};
var context = {};

function getDestination(destination, destinationType) {
    return '/' + destinationType + '/' + destination;
}

function unsubscribe(destination, destinationType) {
  var dest = getDestination(destination, destinationType);

	clients[topic].unsubscribe(dest);
	clients[topic].disconnect();
	clients[topic] = null;
}

function publishMessage(host, port, destination, destinationType, message) {
  var url = host + ':' + port;
  client = publishClients[url] = publishClients[url] ||
    stomp.createClient(
        {
            host: host,
            port: port,
            retryOnClosed: true,
        }
    );
  client.publish('/' + destinationType + '/' + destination, message);
}



function subscribe(host, port, destination, destinationType) {
	var dest = getDestination(destination, destinationType);
	var client = clients[destination] = clients[destination] || new Stomp(host, port);

    msgctx = context.__STOMP__ = context.__STOMP__ || {}
    msgctx[destination] = msgctx[destination] || [];
    client.connect(function (sessionId) {
        client.subscribe(dest, function (body, headers) {
            var msg = {
                body: body,
                headers: headers
            };
            msgctx[destination].push(msg);
        });
    });
}

function getMessages(destination) {
  return context.__STOMP__[destination];
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
    'publishMessage' : publishMessage
};
