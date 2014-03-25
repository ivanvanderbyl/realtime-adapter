/*globals ENV QUnit */

(function (){
  window.Ember = window.Ember || {};
  Ember.config = {};
  Ember.testing = true;
  Ember.LOG_VERSION = true;

  window.ENV = { TESTING: true, LOG_VERSION: true };

  window.setupStore = function(options) {

    var env = {};
    options = options || {};

    var container = env.container = new Ember.Container();

    var adapter = env.adapter = (options.adapter || DS.Adapter);
    delete options.adapter;

    for (var prop in options) {
      container.register('model:' + prop, options[prop]);
    }

    container.register('store:main', DS.Store.extend({
      adapter: adapter
    }));

    container.register('serializer:-default', DS.JSONSerializer);
    container.register('serializer:-rest', DS.RESTSerializer);
    container.register('adapter:-websocket', DS.WebSocketAdapter);

    container.injection('serializer', 'store', 'store:main');

    env.serializer = container.lookup('serializer:-default');
    env.restSerializer = container.lookup('serializer:-rest');
    env.store = container.lookup('store:main');
    env.adapter = env.store.get('defaultAdapter');

    return env;
  };


  // Generate the jQuery expando on window ahead of time
  // to make the QUnit global check run clean
  jQuery(window).data('testing', true);

})();
