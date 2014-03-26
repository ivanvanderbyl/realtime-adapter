var now = function() {
  if (Date.now) {
    return Date.now();
  } else {
    return new Date().valueOf;
  }
};

import Frame from './frame';

var Byte = Frame.Byte;

var Client = Ember.Object.extend(Ember.Evented, {

  connected: false,

  maxWebSocketFrameSize: 16 * 1024,

  /**
   * The WebSocket connection
   * @type WebSocket
   */
  socket: null,

  /**
   * Init
   */
  init: function(){
    this.subscriptions = {};
  },

  /**
   * Expected incoming heartbeat from server
   *
   * @type {Number}
   */
  incomingHeartbeat: 10E3,

  /**
   * Desired outgoing heartbeat from client
   *
   * @type {Number}
   */
  outgoingHeartbeat: 10E3,

  /**
   * Initiates the STOMP layer connection
   *
   * @expose
   * @public
   */
  connect: function(){
    var headers = {};
    var ws = this.get('socket');

    ws.onmessage = Ember.run.bind(this, this.didReceiveMessage);
    ws.onopen = Ember.run.bind(this, this.willConnect, headers);
    ws.onclose = Ember.run.bind(this, this.socketDidClose);
  },

  /**
   * Callback which fires before the STOMP session is negotiated.
   *
   * @param  {Object} headers
   *
   * @expose
   * @public
   */
  willConnect: function(headers) {
    Ember.debug('WebSocket connected');
    headers["accept-version"] = Client.STOMP_VERSIONS.supportedVersions();
    headers["heart-beat"] = [
      this.get('outgoingHeartbeat'),
      this.get('incomingHeartbeat')
    ].join(',');
    this._transmit("CONNECT", headers);
  },

  /**
   * Callback which fires when STOMP session is connected.
   *
   * @type {Function}
   */
  didConnect: Ember.K,

  socketDidClose: function(reason){
    this._cleanUp();
    Ember.debug('WebSocket connection closed');
  },

  /**
   * Callback which is called when the underlying WebSocket receives a message.
   *
   * @param  {String} bytes
   *
   * @expose
   * @public
   */
  didReceiveMessage: function(bytes) {
    this._serverActivity = now();

    if (bytes === Byte.LF) {
      Ember.debug("<<< PONG");
      return;
    }

    var frame = Frame.create();
    frame.unmarshal(bytes);

    switch (frame.command) {
      case "CONNECTED":
        Ember.debug('Connected to server');
        this._setupHeartbeat(frame.headers);
        this.set('connected', true);
        this.didConnect();
      break;
    }
  },

  /**
   * Encodes and Sends a message as a STOMP SEND frame
   *
   * @param  {String} destination
   * @param  {Object} headers
   * @param  {String} body
   *
   * @expose
   * @public
   */
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

    var serverOutgoing = heartbeats[0];
    var serverIncoming = heartbeats[1];

    if (!(this.get('outgoingHeartbeat') === 0 || serverIncoming === 0)) {
      var ttl = Math.max(this.get('outgoingHeartbeat'), serverIncoming);
      Ember.debug("send PING every " + ttl + "ms");

      this.pinger = setInterval(function() {
        if (this.get('socket.readyState') === WebSocket.OPEN) {
          this.get('socket').send(Byte.LF);
        }
      }.bind(this), ttl);
    }

    if (!(this.get('incomingHeartbeat') === 0 || serverOutgoing === 0)) {
      var ttl = Math.max(this.get('incomingHeartbeat'), serverOutgoing);
      Ember.debug("check PONG every " + ttl + "ms");
      this.ponger = setInterval(function() {
        var delta;
        delta = now() - this._serverActivity;
        if (delta > ttl * 2) {
          Ember.debug("did not receive server activity for the last " + delta + "ms");
          this.get('socket').close();
        }
      }.bind(this), ttl);
    }
  },

  _cleanUp: function() {
    this.set('connected', false);
    if (this.pinger) { clearInterval(this.pinger); }
    if (this.ponger) { clearInterval(this.ponger); }
  },

  willDestroy: function(){
    Ember.debug('Destroying client')
    this._cleanUp();
  },
});

Client.reopenClass({

  /**
   * STOMP Versions
   *
   * @type {Object}
   */
  STOMP_VERSIONS: {
    V1_0: '1.0',
    V1_1: '1.1',
    V1_2: '1.2',

    /**
     * Returns suported protocol versions
     *
     * @return {String}
     */
    supportedVersions: function() {
      return '1.1,1.0';
    }
  },

  /**
   * Creates a Client with an active WebSocket connection
   *
   * @param  {WebSocket} ws
   *
   * @return {Realtime.Client}
   * @expose
   * @public
   */
  createWithWebSocket: function(ws){
    return Client.create({ socket: ws });
  },
})

export default Client;
