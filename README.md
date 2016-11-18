#stomp-api
=====

## Disclaimer
Do not use this api for production, it is built for testing purposes.

A REST-full interface for a STOMP-queue (e.g. ActiveMQ);

## How does it work
You can subscribe to a queue or a topic, publish (put) messages and show all received messages.

## API by example
To subscribe to a queue (this will start buffering all incoming messages):
PUT the following application/json to URL: localhost:3000/queues/subscriptions
```
{
	"host": "activemq.host",
	"port": "61613",
	"queue": "test"
}
```

To publish to a queue:
PUT the following application/json to URL: localhost:3000/queues/test
```
{
	"host": "activemq.host",
	"port": "61613",
	"message": "Test message"
}
```

To get all messages received (since subscribing) from a queue:
GET the following URL: localhost:3000/queues/test
This will empty the message buffer.

These examples also apply for topics.
