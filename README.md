# Ember Data WebSocket Adapter a.k.a Ember.Realtime

**This is a work in progress**

This project aims to provide a streaming WebSocket adapter for Ember Data which can entirely replace making individual HTTP requests to a REST API for each action.

This would be achieved by encoding the semantics of REST over a streaming connection using the STOMP protocol.

This adapter will abstract away the STOMP connection and provide a consistent interface to Ember Data for all the standard operations.

Each resource is represented over a multiplexed WebSocket connection as a STOMP Subscription, allowing state changes to be propagated in realtime to all clients with access to that resource.

The benefit this gives, apart from a smaller network footprint, is the reduced complexity of running both an HTTP API and a pusher interface, and merging data client side.

Initially this will focus on creating an adapter for Ruby on Rails which uses the existing conventions provided by `ActiveModelSerializers`.

This adapter will be designed to work out of the box and assume no knowledge of your App.

## The Adapter

The adapter will abstract away the transport of messages over a WebSocket connection to match up to the semantics of a standard Ember Data Adapter. This means we should be able to create a drop in replacement for any other Adapter without the need to change any application code, except for configuring the WebSocket endpoint.

### Wire format

The chosen wire format is [STOMP](http://stomp.github.io/stomp-specification-1.2.html), which has close mapping to HTTP with the addition of streaming support and subscriptions.

This should make developing backends to support this adapter very easy and straight forward.

The over the wire flow can be described like this:
1. When creating a resource, a request containing the JSON representation of the new resource is sent to the server as a `SEND` frame. In the headers of this frame are encoded the destination resource mapping, content type, and action.
2. The server decodes this frame and uses the resource destination to interpret which resource needs to be action upon in much the same way the Rails router will route to a controller based on a path.
3.

#### Heartbeats

The adapter should be responsible for maintaining the connection to the server as needed, and may queue messages for a configurable about of time before returning with an error if a connection is temporarily dropped, and reestablished within a configurable time period.

Because the browser WebSockets API does not expose any configurable keep alive semantics, it is often favourable to implement an application layer heartbeat to check if the connection is active. We implement a heartbeat based on the semantics of the STOMP protocol.

#### Negotiation

When a connection is opened to the server it is necessary to authenticate the client, negotiate heartbeat intervals, and specification version.

STOMP provides its own mechanism for negotiating protocol versions, we may add our own additional mechanism for negotiating the backend serialisation and version.
