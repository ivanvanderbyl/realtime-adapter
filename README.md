# Ember Data WebSocket Adapter

**This is a work in progress**

This project aims to provide a streaming WebSocket adapter for Ember Data which can entirely replace making individual HTTP requests to a REST API for each action.

This would be achieved by providing a wire format to encode the semantics of typical CRUD oparations and send them over a WebSocket connection to a corresponding decoder on the other end which would in turn translate them into actions on the server.

The benefit this gives, apart from a smaller network footprint, is the ability to push updates to each subscribed client for an updated resource, in realtime, and without the added complexity of munging results with those returned by other HTTP based adapter.

Initially this will focus on creating an adapter for Ruby on Rails which uses the existing conventions provided by `ActiveModelSerializers`.

## Specification

All of this is still in flux, and more of a proposal than a specification, but we'll get there.

#### Wire format

Request for a resource:

```
<SEQUENCE>,<VERB>,<RESOURCE TYPE>,<RESOURCE ID>,<JSON PAYLOAD>

# Example:

12,GET,post,78,
```

Would reply with:

```
<SEQUENCE>,<RESOURCE TYPE>,<RESOUECE ID>,<JSON PAYLOAD>

# Example:
12,post,78,{"post": {"id": 78, "title": "Test Post"}}

```

Requests must contain 5 components separated by `,` even if they are empty, and responses must contan 4 components separated by `,` even if they are empty.

