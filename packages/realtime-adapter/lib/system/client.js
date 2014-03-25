var now = function() {
  if (Date.now) {
    return Date.now();
  } else {
    return new Date().valueOf;
  }
};

import Frame from './frame';

var Client = Ember.Object.extend({

  connected: false,

  maxWebSocketFrameSize: 16 * 1024,

  /**
   * The WebSocket connection
   * @type WebSocket
   */
  socket: null,

  init: function(){
    this.heartbeat = {
      outgoing: 10000,
      incoming: 10000
    };
    this.subscriptions = {};
  },

  connect: function(){
    var headers = {};
    var ws = this.get('socket');

    ws.onmessage = Ember.run.bind(this, this.didReceiveMessage);
    ws.onopen = Ember.run.bind(this, this.willConnect, headers);
  },

  willConnect: function(headers) {
    Ember.debug('WebSocket connected');
    headers["accept-version"] = Client.STOMP_VERSIONS.supportedVersions();
    headers["heart-beat"] = [this.heartbeat.outgoing, this.heartbeat.incoming].join(',');
    this._transmit("CONNECT", headers);
  },

  didReceiveMessage: function(bytes) {
    var frame = Frame.create();
    frame.unmarshal(bytes);

    this.serverActivity = now();

    switch (frame.command) {
      case "CONNECTED":
        Ember.debug('Connected to server');
        this.set('connected', true);
        this._setupHeartbeat(frame.headers);
      break;
    }
  },

  send: function(destination, headers, body) {
    if (!headers) { headers = {}; }
    if (!body) { body = ''; }

    headers['destination'] = destination;
    return this._transmit("SEND", headers, body);
  },

  _transmit: function(command, headers, body){
    var out;
    out = Frame.createWithCommand(command, headers, body).marshal();

    Ember.debug("Client: >>> " + out.substring(0, 256) + '...');

    var socket = this.get('socket');

    while (true) {
      if (out.length > this.maxWebSocketFrameSize) {
        socket.send(out.substring(0, this.maxWebSocketFrameSize));
        out = out.substring(this.maxWebSocketFrameSize);
        Ember.debug("Client: remaining = " + out.length);
      } else {
        return socket.send(out);
      }
    }
  },

  _setupHeartbeat: function(headers){
    var version = headers.version;
    if (version !== Client.STOMP_VERSIONS.V1_1 && version !== Client.STOMP_VERSIONS.V1_2) {
      return;
    }

    var heartbeats = headers['heart-beat'].split(",").map(function(ttl) {
      return parseInt(ttl);
    });
    Ember.debug(heartbeats.join(', '))

    var serverOutgoing = heartbeats[0];
    var serverIncoming = heartbeats[1];

    if (!(this.heartbeat.outgoing === 0 || serverIncoming === 0)) {
      var ttl = Math.max(this.heartbeat.outgoing, serverIncoming);
      Ember.debug("send PING every " + ttl + "ms");

      this.pinger = setInterval(function() {
        if (this.get('socket').readyState === WebSocket.OPEN) {
          this.get('socket').send(Byte.LF);
        }
      }.bind(this), ttl);
    }

    if (!(this.heartbeat.incoming === 0 || serverOutgoing === 0)) {
      var ttl = Math.max(this.heartbeat.incoming, serverOutgoing);
      Ember.debug("check PONG every " + ttl + "ms");
      this.ponger = setInterval(function() {
        var delta;
        delta = now() - this.serverActivity;
        if (delta > ttl * 2) {
          Ember.debug("did not receive server activity for the last " + delta + "ms");
        }
        this.get('socket').close();
      }.bind(this), ttl);
    }
  },

  willDestroy: function(){
    clearInterval(this.pinger);
  },
});

Client.reopenClass({
  STOMP_VERSIONS: {
    V1_0: '1.0',
    V1_1: '1.1',
    V1_2: '1.2',
    supportedVersions: function() {
      return '1.1,1.0';
    }
  },

  createWithWebSocket: function(ws){
    return Client.create({ socket: ws });
  },
})

export default Client;