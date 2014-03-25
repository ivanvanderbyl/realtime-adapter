test( 'Ensure Ember is loaded', function() {
  ok(typeof(Ember) !== 'undefined', "Ember should be loaded")
});

test( 'Ensure DS is loaded', function() {
  ok(typeof(DS) !== 'undefined', "Ember Data should be loaded")
});

test( 'Ensure Realtime is loaded', function() {
  ok(typeof(Realtime) !== 'undefined', "Realtime should be loaded")
});

test( 'Ensure WebSocketAdapter is loaded', function() {
  ok(typeof(Realtime.WebSocketAdapter) !== 'undefined', "DS.WebSocketAdapter should be loaded")
});
