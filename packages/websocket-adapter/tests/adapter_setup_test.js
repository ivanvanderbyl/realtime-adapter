var env, store, adapter;

// var WebSocketAdapter = require('websocket_adapter');

test( 'Ensure Ember is loaded', function() {
  ok(typeof(Ember) !== 'undefined', "Ember should be loaded")
});

test( 'Ensure WebSocketAdapter is loaded', function() {
  ok(typeof(DS.WebSocketAdapter) !== 'undefined', "WebSocketAdapter should be loaded")
});

module("unit/adapter/path_for_type - WebSocketAdapter#pathForType", {
  setup: function() {
    env = setupStore({
      adapter: DS.WebSocketAdapter
    });

    adapter = env.adapter;
  }
});

test('pathForType - works with camelized types', function() {
  equal(adapter.pathForType('superUser'), "super_users");
});

test('pathForType - works with dasherized types', function() {
  equal(adapter.pathForType('super-user'), "super_users");
});

test('pathForType - works with underscored types', function() {
  equal(adapter.pathForType('super_user'), "super_users");
});
