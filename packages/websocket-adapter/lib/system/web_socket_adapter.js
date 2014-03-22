// import {Adapter} from "ember-data/lib/system/adapter";

var WebSocketAdapter = DS.Adapter.extend({
  defaultSerializer: '-websocket',

  pathForType: function(type){
    return 'unknown_type';
  },

  find: function(store, type, id){

  },

  /**
    @private
    @method findAll
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {String} sinceToken
    @return {Promise} promise
  */
  findAll: function(store, type, sinceToken){

  },

  /**
    This method is called when you call `find` on the store with a
    query object as the second parameter (i.e. `store.find('person', {
    page: 1 })`).

    Example

    ```javascript
    App.ApplicationAdapter = DS.Adapter.extend({
      findQuery: function(store, type, query) {
        var url = type;
        return new Ember.RSVP.Promise(function(resolve, reject) {
          jQuery.getJSON(url, query).then(function(data) {
            Ember.run(null, resolve, data);
          }, function(jqXHR) {
            jqXHR.then = null; // tame jQuery's ill mannered promises
            Ember.run(null, reject, jqXHR);
          });
        });
      }
    });
    ```

    @private
    @method findQuery
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} query
    @param {DS.AdapterPopulatedRecordArray} recordArray
    @return {Promise} promise
  */
  findQuery: function(store, type, query, recordArray) {

  },

  /**
    Implement this method in a subclass to handle the creation of
    new records.

    Serializes the record and send it to the server.

    Example

    ```javascript
    App.ApplicationAdapter = DS.Adapter.extend({
      createRecord: function(store, type, record) {
        var data = this.serialize(record, { includeId: true });
        var url = type;

        return new Ember.RSVP.Promise(function(resolve, reject) {
          jQuery.ajax({
            type: 'POST',
            url: url,
            dataType: 'json',
            data: data
          }).then(function(data) {
            Ember.run(null, resolve, data);
          }, function(jqXHR) {
            jqXHR.then = null; // tame jQuery's ill mannered promises
            Ember.run(null, reject, jqXHR);
          });
        });
      }
    });
    ```

    @method createRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type   the DS.Model class of the record
    @param {DS.Model} record
    @return {Promise} promise
  */
  createRecord: function(store, type, record) {

  },
});

export default WebSocketAdapter;
