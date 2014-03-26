var client, ws;

var Byte = {
  LF: '\x0A',
  NULL: '\x00'
};

var Socket = function() {};
Socket.prototype = {
  close: function(){
    this.onclose();
  },

  lastSend: null,
  readyState: WebSocket.CLOSED,

  send: function(data){
    this.lastSend = data;
  },
  onopen: function() {},
  onclose: function() {}
}

module("client - Client", {
  setup: function() {
    ws = new Socket();

    client = Realtime.Client.createWithWebSocket(ws);
  },

  teardown: function() {
    Ember.run(function() {
      client.destroy();
    })
  }
});

test( 'send large payload', function() {
  var spy = sinon.spy(ws, 'send');

  var body = [];
  for (var i = (1024 * 24) - 1; i >= 0; i--) {
    body.push('A');
  }

  var largeBody = {
    content: body.join('')
  }

  equal(largeBody.content.length, 24*1024, 'has large body')
  client.send('post/1', {}, largeBody);

  ok(spy.calledTwice, 'send is called twice');
});

test('sends a CONNECT frame after connecting', function () {
  var spy = sinon.spy(ws, 'send');

  client.connect();

  var frameData = Realtime.Frame.createWithCommand('CONNECT', {
    "accept-version": '1.1,1.0',
    "heart-beat": "10000,10000"
  }).marshal()

  // Fake the onopen event
  ws.onopen()

  ok(spy.withArgs(frameData).calledOnce, 'sends CONNECT frame');
});

var connectedFrameData;

module('client#didReceiveMessage - Client', {
  setup: function(){
    ws = new Socket();
    ws.readyState = WebSocket.OPEN;

    client = Realtime.Client.createWithWebSocket(ws);
    client.set('incomingHeartbeat', 10);
    client.set('outgoingHeartbeat', 10);

    connectedFrameData = Realtime.Frame.createWithCommand('CONNECTED', {
      "version": '1.1',
      "heart-beat": "10,10",
    }).marshal()
  },

  teardown: function() {
    Ember.run(function() {
      client.destroy();
    })
  }
});

test( 'socket is setup', function() {
  ok(client.get('socket') !== null, 'socket defined');
});

test('handles CONNECTED message', function() {
  client.connect();
  client.didReceiveMessage(connectedFrameData);
  ok(client.get('connected'), 'client is connected');
});

asyncTest('configures heartbeat and closes connection if no pong is received', function() {
  expect(2)
  client.connect();

  client.didReceiveMessage(connectedFrameData);
  equal(client.get('connected'), true, 'connection is open');

  setTimeout(function() {
    equal(client.get('connected'), false, 'connection was closed');
    QUnit.start()
  }, 50);
});

asyncTest('configures heartbeat and maintains connection when receiving PONGs', function() {
  expect(2)
  client.connect();

  var pingCount = 0;
  var spy = sinon.spy(ws, 'send');

  client.didReceiveMessage(connectedFrameData);

  var serverPing = setInterval(function() {
    pingCount++;

    client.didReceiveMessage(Byte.LF);

    if (pingCount == 5) clearInterval(serverPing);
  }, 10);

  setTimeout(function() {
    equal(client.get('connected'), true, 'connection is open');
    // ok(spy.withArgs(Byte.LF).called, 'ping was sent')
    equal(pingCount, 5, '5 pings sent');
    QUnit.start()
  }, 55);
});

asyncTest('emits client heartbeat messages', function() {
  expect(1)
  var spy = sinon.spy(ws, 'send');
  var pingCount = 0;

  client.connect();
  client.didReceiveMessage(connectedFrameData);

  var serverPing = setInterval(function() {
    pingCount++;

    client.didReceiveMessage(Byte.LF);

    if (spy.withArgs(Byte.LF).callCount === 5) clearInterval(serverPing);
  }, 10);

  setTimeout(function() {
    equal(spy.withArgs(Byte.LF).callCount, 5, 'ping was sent')
    QUnit.start()
  }, 55);
})
