var client, ws;

var Byte = {
  LF: '\x0A',
  NULL: '\x00'
};

module("client - Client", {
  setup: function() {
    ws = new FakeWebSocket();

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
    ws = new FakeWebSocket();
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
  expect(2)
  var spy = sinon.spy(client, 'didConnect');
  client.connect();
  client.didReceiveMessage(connectedFrameData);


  ok(spy.calledOnce, 'connect callback fired')
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

module('subscriptions', {
  setup: function() {
    ws = new FakeWebSocket();
    ws.readyState = WebSocket.OPEN;
    client = Realtime.Client.createWithWebSocket(ws);
  },

  teardown: function() {
    Ember.run(function() {
      client.destroy();
    })
  }
})

test('sends a SUBSCRIBE frame', function () {
  var spy = sinon.spy(ws, 'send');
  client.connect();
  // Fake the onopen event
  ws.onopen()

  client.subscribe('posts/1', {}, function() {

  });

  var frameData = Realtime.Frame.createWithCommand('SUBSCRIBE', {
    id: 'sub-0',
    destination: 'posts/1'
  }).marshal()

  ok(spy.withArgs(frameData).calledOnce, 'sends SUBSCRIBE frame');
});

asyncTest('creates a subscription which can receive messages', function () {
  expect(4);

  var spy = sinon.spy(client, 'ack');

  var received = sinon.stub();

  client.connect();
  // Fake the onopen event
  ws.onopen();

  var subID = client.subscribe('posts/1', {}, function(frame) {
    ok(true, 'subscription callback did fire')
    equal(frame.headers.subscription, subID, 'received correct subscription message');
    equal(frame.body.post.title, 'Realtime Ember', 'message has correct body');

    frame.ack();

    ok(spy.calledOnce, 'ACK called');

    QUnit.start();
  });

  var frameData = Realtime.Frame.createWithCommand('MESSAGE', {
    subscription: subID,
    destination: 'posts/1'
  }, {
    post: { title: 'Realtime Ember' }
  }).marshal();

  client.didReceiveMessage(frameData);
});
