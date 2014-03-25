var client, ws;

module("client - Client", {
  setup: function() {
    ws = {
      send: function() {},
      onopen: function() {},
    }

    client = Realtime.Client.createWithWebSocket(ws);
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

var frameData;

module('client#didReceiveMessage - Client', {
  setup: function(){
    client = Realtime.Client.createWithWebSocket(null);
    frameData = Realtime.Frame.createWithCommand('CONNECTED', {
      "version": '1.1',
      "heart-beat": "10000,10000",
    }).marshal()
  }
});

test('handles CONNECTED message', function() {
  client.didReceiveMessage(frameData);
  ok(client.get('connected'), 'client is connected');
});

test('configures heartbeat timers after connected', function() {
  client.didReceiveMessage(frameData);

});