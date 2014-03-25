var env, store, adapter;

// var WebSocketAdapter = require('websocket_adapter');

// module("unit/adapter/path_for_type - WebSocketAdapter#pathForType", {
//   setup: function() {
//     env = setupStore({
//       adapter: DS.WebSocketAdapter.extend({
//         socketEndpoint: 'ws://localhost:9997/api/v1/stream'
//       })
//     });

//     adapter = env.adapter;
//   }
// });

// test('pathForType - works with camelized types', function() {
//   equal(adapter.pathForType('superUser'), "super_users");
// });

// test('pathForType - works with dasherized types', function() {
//   equal(adapter.pathForType('super-user'), "super_users");
// });

// test('pathForType - works with underscored types', function() {
//   equal(adapter.pathForType('super_user'), "super_users");
// });
