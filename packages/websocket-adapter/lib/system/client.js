var now = function() {
  if (Date.now) {
    return Date.now();
  } else {
    return new Date().valueOf;
  }
};

import Frame from './frame';

var Client = Ember.Object.extend({

  STOMP_VERSIONS: {
    V1_0: '1.0',
    V1_1: '1.1',
    V1_2: '1.2',
    supportedVersions: function() {
      return '1.1,1.0';
    }
  },

  connected: false,

  maxWebSocketFrameSize: 16 * 1024,

  /**
   * The WebSocket connection
   * @type WebSocket
   */
  socket: null,

  init: function(){
    this.subscriptions = {};
  },

  connect: function(){
    var headers = {};
    var ws = this.get('socket');

    // ws.onmessage = function(bytes) {

    // }.bind(this);

    var that = this;
    ws.onopen = function() {
      Ember.debug('WebSocket connected');
      headers["accept-version"] = that.STOMP_VERSIONS.supportedVersions();
      // headers["heart-beat"] = [_this.heartbeat.outgoing, _this.heartbeat.incoming].join(',');
      that._transmit("CONNECT", headers);

    }//.bind(this);
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
});

Client.reopenClass({
  createWithWebSocket: function(ws){
    return Client.create({ socket: ws });
  },
})

export default Client;