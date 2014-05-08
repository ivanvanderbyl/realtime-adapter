# Ember Data WebSocket Adapter a.k.a Ember.Realtime

**This is a work in progress**

This project aims to provide a streaming WebSocket adapter for Ember Data which can entirely replace making individual HTTP requests to a REST API for each action.

This would be achieved by encoding the semantics of REST over a streaming connection using an extension of the STOMP protocol.

This adapter will abstract away the STOMP connection and provide a consistent interface to Ember Data for all the standard operations.

Each resource is represented over a multiplexed WebSocket connection as a STOMP Subscription, allowing state changes to be propagated in realtime to all clients with access to that resource.

The benefit this gives, apart from a smaller network footprint, is the reduced complexity of not needing to run both an HTTP API and a pusher interface (Pusher, Custom WebSockets, Socket.io etc.), and merging data client side.

Initially this will focus on creating an adapter for Ruby on Rails which uses the existing conventions provided by `ActiveModelSerializers`.

This adapter will be designed to work out of the box and assume no knowledge of your Application's code, and thus be a drop in replacement for any of the existing Ember Data adapters.

The back-end service this adapter talks to is written in Go and uses Redis to manage subscriptions, making it language agnostic as anything which can talk to Redis can by extension communicate with the realtime back-end.

## The Adapter

The adapter will abstract away the transport of messages over a WebSocket connection to match up to the semantics of a standard Ember Data Adapter. This means we should be able to create a drop in replacement for any other Adapter without the need to change any application code, except for configuring the WebSocket endpoint.

### Wire format

The chosen wire format is [STOMP](http://stomp.github.io/stomp-specification-1.2.html), which has close mapping to HTTP with the addition of streaming support and subscriptions.

This should make developing backends to support this adapter very easy and straight forward.

The over the wire flow can be described like this:

1. When creating a resource, a request containing the JSON representation of the new resource is sent to the server as a `SEND` frame. In the headers of this frame are encoded the destination resource mapping, content type, and action.
2. The server decodes this frame and uses the resource destination to interpret which resource needs to be action upon in much the same way the Rails router will route to a controller based on a path.

#### Heartbeats

The STOMP protocol specifies specifics for handling heartbeats between server and client. However because we're using WebSockets as the transport layer we've omitted the actual PING and PONG frames from STOMP in favour of using the built in WebSocket heartbeat semantics.

The client and server do still negotiate a heartbeat between each other upon connect at an application level. This is done in the form of a `heartbeat` header as described in the STOMP protocol:

> In order to enable heart-beating, each party has to declare what it can do and what it would like the other party to do. This happens at the very beginning of the STOMP session, by adding a heart-beat header to the CONNECT and CONNECTED frames.
> When used, the heart-beat header MUST contain two positive integers separated by a comma.
> The first number represents what the sender of the frame can do (outgoing heart-beats):
> - 0 means it cannot send heart-beats
> - otherwise it is the smallest number of milliseconds between heart-beats that it can guarantee
> The second number represents what the sender of the frame would like to get (incoming heart-beats):
> - 0 means it does not want to receive heart-beats
> - otherwise it is the desired number of milliseconds between heart-beats

The browser WebSocket API doesn't provide any semantics for controlling the heartbeat of the underlying WebSocket connection, instead it will simply reply to any `ping` frames from the server. Because of this the server is responsible for continually maintaining the connection.

#### Negotiation

When a connection is opened to the server it is necessary to authenticate the client, negotiate heartbeat intervals, and specification version.

STOMP provides its own mechanism for negotiating protocol versions, we may add our own additional mechanism for negotiating the backend serialisation and version.
