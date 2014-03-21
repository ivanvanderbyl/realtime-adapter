// import {Adapter} from "ember-data/lib/system/adapter";

var WebSocketAdapter = DS.Adapter.extend({
  defaultSerializer: '-websocket',

});

export default WebSocketAdapter;
