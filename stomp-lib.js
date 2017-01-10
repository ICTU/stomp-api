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
    if(subscriptions[destination]) {
        return;
    }

    var subscription = subscriptions[destination] = new Stomp(host, port);

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
    var result = context.__STOMP__[destination].pop();

    if (result) {
        callback(result);
    } else {
        Q.delay(2000).done(function () { pop(destination, callback) });
    }
}

function flush(destination) {
    context.__STOMP__[destination] = [];
}

module.exports = {
    'subscribe': subscribe,
    'unsubscribe': unsubscribe,
    'getMessages': getMessages,
    'flush': flush,
    'publishMessage': publishMessage,
    'pop': pop
};