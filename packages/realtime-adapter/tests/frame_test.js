var frame, body;

module("frame - Frame", {
  setup: function() {
    body = {
      post: { title: 'Realtime Ember Data' }
    };

    frame = Realtime.Frame.createWithCommand('CONNECT', {
      authorization: 'TOKEN'
    }, body);
  }
});

test('encodes and decodes frame headers', function() {
  var expectedFrame = Realtime.Frame.create();

  var encodedFrame = frame.marshal();

  expectedFrame.unmarshal(encodedFrame);

  deepEqual(
    frame.get('headers')['authorization'],
    expectedFrame.get('headers')['authorization'], 'encodes a frame to bytes');
});

test('encodes and decodes frame command', function() {
  var expectedFrame = Realtime.Frame.create();
  var encodedFrame = frame.marshal();

  expectedFrame.unmarshal(encodedFrame);

  equal(frame.get('command'), 'CONNECT', 'frame command')

  equal(
    frame.get('command'),
    expectedFrame.get('command'), 'decode encoded frame command');
});

test('encodes and decodes frame body', function() {
  var expectedFrame = Realtime.Frame.create();
  var encodedFrame = frame.marshal();

  expectedFrame.unmarshal(encodedFrame);

  deepEqual(frame.get('body'), body, 'original frame body');
  deepEqual(expectedFrame.get('body'), body, 'expected frame body');
  deepEqual(frame.get('body'), expectedFrame.get('body'), 'decode encoded frame body');
});

// test('aliases subscription to headers.subscription', function() {
//   var frame = Realtime.Frame.createWithCommand('SEND', { headers: { subscription: 'sub-01' } });
//   equal(frame.get('headers.subscription'), 'sub-01', 'subscription is aliased');
// });
