# Ember Data WebSocket Adapter

**This is a work in progress**

This project aims to provide a streaming WebSocket adapter for Ember Data which can entirely replace making individual HTTP requests to a REST API for each action.

This would be achieved by providing a wire format to encode the semantics of typical CRUD oparations and send them over a WebSocket connection to a corresponding decoder on the other end which would in turn translate them into actions on the server.

The benefit this gives, apart from a smaller network footprint, is the ability to push updates to each subscribed client for an updated resource, in realtime, and without the added complexity of munging results with those returned by other HTTP based adapter.

Initially this will focus on creating an adapter for Ruby on Rails which uses the existing conventions provided by `ActiveModelSerializers`.

## Specification

All of this is still in flux, and more of a proposal than a specification, but we'll get there.

### Wire format

Request for a resource:

```
<SEQUENCE>,<VERB>,<RESOURCE TYPE>,<RESOURCE ID>,<JSON PAYLOAD>

# Example:
1,GET,post,78,
```

Would reply with:

```
<SEQUENCE>,<RESOURCE TYPE>,<RESOUECE ID>,<JSON PAYLOAD>

# Example:
1,post,78,{"post": {"id": 78, "title": "Test Post"}}

```

Requests must contain 5 components separated by `,` even if they are empty, and responses must contan 4 components separated by `,` even if they are empty.

#### SEQUENCE

Sequence is an auto incrementing number to correlate messages when they return. Each request message should have a unique sequence number.

#### VERB

Verb represents the normal HTTP method to translate to an action on the server.

**Discussion***
_It might make more sense for this to be the name of a CRUD action_

This would better represent requesting the list of resources and a single resource.

#### RESOURCE TYPE

The name of a resource on the server for which to act upon.

#### RESOURCE ID

The unique identifier of the server side resource. If left blank, the server should respond with a collection of resources according to its own semantics.

#### JSON PAYLOAD

A standard JSON serialized payload representing the resource being requested. When making requests to modify a resource, this may only include changed attributes, or all attributes.

When making a request for a single resource should be left blank. However, when requesting a collection of resources this can include params used for filtering or otherwise manipulating the source collection e.g. sorting on the server.

Proposed JSON schema: `ActiveModelSerializers` format.

### Heartbeats

The adapter should be responsible for maintaining the connection to the server as needed, and may queue messages for a configurable about of time before returning with an error if a connection is temporarily dropped, and reestablished within a configurable time period.

Because the browser WebSockets API does not expose any configurable keep alive semantics, it is often favorable to implement an application layer heartbeat to check if the connection is active. I propose that we use similar semantics to [engine.io](https://github.com/LearnBoost/engine.io/blob/master/lib/socket.js#L85-L89). This is often necessary because a WebSocket connection can indicate that it's still connected up until you send a message and find that it's actually closed, which results in an error. It would be nice to know these events sooner.

Proposed ping interval: `5 seconds`

### Negotiation

When a connection is opened to the server it would be necessary to authenticate the client, negotiate heartbeat intervals, and specification version.

It would be fair to say that the first message sent to the server much be a negotiation message, as WebSockets don't provide any sort of message buffering on the client which could resend previous messages upon reconnection.



