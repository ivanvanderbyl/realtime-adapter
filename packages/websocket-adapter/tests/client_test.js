var client, largeBody, ws;

module("client - Client", {
  setup: function() {
    ws = {
      send: function() {},
      onopen: function() {},
    }

    var body = [];

    for (var i = (1024 * 24) - 1; i >= 0; i--) {
      body.push('A');
    }

    largeBody = {
      content: body.join('')
    }

    client = Realtime.Client.createWithWebSocket(ws);
  }
});

test( 'send large payload', function() {
  equal(largeBody.content.length, 24*1024, 'has large body')
  var spy = sinon.spy(ws, 'send');

  client.send('post/1', {}, largeBody);

  ok(spy.calledTwice, 'send is called twice');
});

test('sends a CONNECT frame after connecting', function () {
  var spy = sinon.spy(ws, 'send');

  client.connect();

  var frameData = Realtime.Frame.createWithCommand('CONNECT', {
    "accept-version": client.STOMP_VERSIONS.supportedVersions()
  }).marshal()

  // Fake the onopen event
  ws.onopen()

  ok(spy.withArgs(frameData).calledOnce, 'sends CONNECT frame');
});
