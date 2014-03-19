import {Adapter} from "ember-data/system/adapter";

var WebSocketAdapter = Adapter.extend({
  defaultSerializer: '-websocket',

});

export default WebSocketAdapter;
