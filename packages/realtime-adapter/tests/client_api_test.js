module('Public API Methods - Client', {
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

test( '#nack sends a NACK frame', function() {
  var spy = sinon.spy(ws, 'send');

  client.nack('1', 'sub-01', {})

  var frameData = Realtime.Frame.createWithCommand('NACK', {
    'message-id': '1',
    'subscription': 'sub-01'
  }).marshal();

  ok(spy.calledOnce, 'socket received send');
  equal(spy.firstCall.args, frameData, 'called with frame');
});


test( '#ack sends an ACK frame', function() {
  var spy = sinon.spy(ws, 'send');

  client.ack('1', 'sub-01', {})

  var frameData = Realtime.Frame.createWithCommand('ACK', {
    'message-id': '1',
    'subscription': 'sub-01'
  }).marshal();

  ok(spy.calledOnce, 'socket received send');
  equal(spy.firstCall.args, frameData, 'called with frame');
});

test( '#abort sends an ABORT frame', function() {
  var spy = sinon.spy(ws, 'send');

  client.abort('tx-01');

  var frameData = Realtime.Frame.createWithCommand('ABORT', {
    'transaction': 'tx-01',
  }).marshal();

  ok(spy.calledOnce, 'socket received send');
  equal(spy.firstCall.args, frameData, 'called with frame');
});

test( '#commit sends an COMMIT frame', function() {
  var spy = sinon.spy(ws, 'send');

  client.commit('tx-01');

  var frameData = Realtime.Frame.createWithCommand('COMMIT', {
    'transaction': 'tx-01',
  }).marshal();

  ok(spy.calledOnce, 'socket received send');
  equal(spy.firstCall.args, frameData, 'called with frame');
});

test( '#begin sends an BEGIN frame and returns a transaction', function() {
  expect(5)
  var spy = sinon.spy(ws, 'send');

  var tx = client.begin();

  var beginFrame = Realtime.Frame.createWithCommand('BEGIN', {
    'transaction': 'tx-0',
  }).marshal();

  var commitFrame = Realtime.Frame.createWithCommand('COMMIT', {
    'transaction': 'tx-0',
  }).marshal();

  tx.commit();

  ok(spy.calledTwice, 'socket received send twice');
  equal(spy.firstCall.args, beginFrame, 'called with begin frame');
  equal(spy.secondCall.args, commitFrame, 'called with commit frame');
  equal(tx.id, 'tx-0', 'transaction id is returned');
  ok(!!tx.abort, 'tx object can be aborted');
});

