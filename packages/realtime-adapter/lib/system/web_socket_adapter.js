// import {Adapter} from "ember-data/lib/system/adapter";

import Client from "./client";

var WebSocketAdapter = DS.Adapter.extend({
  defaultSerializer: '-websocket',

  init: function(){
    var socketEndpoint = this.get('socketEndpoint');
    if (!socketEndpoint || typeof socketEndpoint !== 'string') {
      throw new Error('Please set the `socketEndpoint` property on the adapter.');
    }

    if (!/^wss?\:\/\//.test(socketEndpoint)) {
      throw new Error('socketEndpoint must start with a scheme of ws:// or wss://');
    }

    this._connect(socketEndpoint);
  },

  /**
    Called by the store in order to fetch the JSON for a given
    type and ID.

    The `find` method makes an Ajax request to a URL computed by `buildDestinationPath`, and returns a
    promise for the resulting payload.

    This method performs an HTTP `GET` request with the id provided as part of the query string.

    @method find
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {String} id
    @returns {Promise} promise
  */
  find: function(store, type, id) {
    return this.request(this.buildDestinationPath(type.typeKey, id), 'GET');
  },

  /**
    Called by the store in order to fetch a JSON array for all
    of the records for a given type.

    The `findAll` method makes an Ajax (HTTP GET) request to a URL computed by `buildDestinationPath`, and returns a
    promise for the resulting payload.

    @private
    @method findAll
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {String} sinceToken
    @returns {Promise} promise
  */
  findAll: function(store, type, sinceToken) {
    var query;

    if (sinceToken) {
      query = { since: sinceToken };
    }

    return this.request(this.buildDestinationPath(type.typeKey), 'GET', { data: query });
  },

  /**
    Called by the store in order to fetch a JSON array for
    the records that match a particular query.

    The `findQuery` method makes an Ajax (HTTP GET) request to a URL computed by `buildDestinationPath`, and returns a
    promise for the resulting payload.

    The `query` argument is a simple JavaScript object that will be passed directly
    to the server as parameters.

    @private
    @method findQuery
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} query
    @returns {Promise} promise
  */
  findQuery: function(store, type, query) {
    return this.request(this.buildDestinationPath(type.typeKey), 'GET', { data: query });
  },

  /**
    Called by the store in order to fetch a JSON array for
    the unloaded records in a has-many relationship that were originally
    specified as IDs.

    For example, if the original payload looks like:

    ```js
    {
      "id": 1,
      "title": "Rails is omakase",
      "comments": [ 1, 2, 3 ]
    }
    ```

    The IDs will be passed as a URL-encoded Array of IDs, in this form:

    ```
    ids[]=1&ids[]=2&ids[]=3
    ```

    Many servers, such as Rails and PHP, will automatically convert this URL-encoded array
    into an Array for you on the server-side. If you want to encode the
    IDs, differently, just override this (one-line) method.

    The `findMany` method makes an Ajax (HTTP GET) request to a URL computed by `buildDestinationPath`, and returns a
    promise for the resulting payload.

    @method findMany
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Array} ids
    @returns {Promise} promise
  */
  findMany: function(store, type, ids) {
    return this.request(this.buildDestinationPath(type.typeKey), 'GET', { data: { ids: ids } });
  },

  /**
    Called by the store in order to fetch a JSON array for
    the unloaded records in a has-many relationship that were originally
    specified as a URL (inside of `links`).

    For example, if your original payload looks like this:

    ```js
    {
      "post": {
        "id": 1,
        "title": "Rails is omakase",
        "links": { "comments": "/posts/1/comments" }
      }
    }
    ```

    This method will be called with the parent record and `/posts/1/comments`.

    The `findHasMany` method will make an Ajax (HTTP GET) request to the originally specified URL.
    If the URL is host-relative (starting with a single slash), the
    request will use the host specified on the adapter (if any).

    @method findHasMany
    @param {DS.Store} store
    @param {DS.Model} record
    @param {String} url
    @returns {Promise} promise
  */
  findHasMany: function(store, record, url) {
    var host = get(this, 'host'),
        id   = get(record, 'id'),
        type = record.constructor.typeKey;

    if (host && url.charAt(0) === '/' && url.charAt(1) !== '/') {
      url = host + url;
    }

    return this.request(this.urlPrefix(url, this.buildDestinationPath(type, id)), 'GET');
  },

  /**
    Called by the store in order to fetch a JSON array for
    the unloaded records in a belongs-to relationship that were originally
    specified as a URL (inside of `links`).

    For example, if your original payload looks like this:

    ```js
    {
      "person": {
        "id": 1,
        "name": "Tom Dale",
        "links": { "group": "/people/1/group" }
      }
    }
    ```

    This method will be called with the parent record and `/people/1/group`.

    The `findBelongsTo` method will make an Ajax (HTTP GET) request to the originally specified URL.

    @method findBelongsTo
    @param {DS.Store} store
    @param {DS.Model} record
    @param {String} url
    @returns {Promise} promise
  */
  findBelongsTo: function(store, record, url) {
    var id   = get(record, 'id'),
        type = record.constructor.typeKey;

    return this.request(this.urlPrefix(url, this.buildDestinationPath(type, id)), 'GET');
  },

  /**
    Called by the store when a newly created record is
    saved via the `save` method on a model record instance.

    The `createRecord` method serializes the record and makes an Ajax (HTTP POST) request
    to a URL computed by `buildDestinationPath`.

    See `serialize` for information on how to customize the serialized form
    of a record.

    @method createRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {DS.Model} record
    @returns {Promise} promise
  */
  createRecord: function(store, type, record) {
    var data = {};
    var serializer = store.serializerFor(type.typeKey);

    serializer.serializeIntoHash(data, type, record, { includeId: true });

    return this.request(this.buildDestinationPath(type.typeKey), "SET", { data: data });
  },

  /**
    Called by the store when an existing record is saved
    via the `save` method on a model record instance.

    The `updateRecord` method serializes the record and makes an Ajax (HTTP PUT) request
    to a URL computed by `buildDestinationPath`.

    See `serialize` for information on how to customize the serialized form
    of a record.

    @method updateRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {DS.Model} record
    @returns {Promise} promise
  */
  updateRecord: function(store, type, record) {
    var data = {};
    var serializer = store.serializerFor(type.typeKey);

    serializer.serializeIntoHash(data, type, record);

    var id = get(record, 'id');

    return this.request(this.buildDestinationPath(type.typeKey, id), "UPDATE", { data: data });
  },

  /**
    Called by the store when a record is deleted.

    The `deleteRecord` method  makes an Ajax (HTTP DELETE) request to a URL computed by `buildDestinationPath`.

    @method deleteRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {DS.Model} record
    @returns {Promise} promise
  */
  deleteRecord: function(store, type, record) {
    var id = get(record, 'id');

    return this.request(this.buildDestinationPath(type.typeKey, id), "DELETE");
  },

  /**
    Builds a URL for a given type and optional ID.

    By default, it pluralizes the type's name (for example, 'post'
    becomes 'posts' and 'person' becomes 'people'). To override the
    pluralization see [pathForType](#method_pathForType).

    If an ID is specified, it adds the ID to the path generated
    for the type, separated by a `/`.

    @method buildDestinationPath
    @param {String} type
    @param {String} id
    @returns {String} url
  */
  buildDestinationPath: function(type, id) {
    var url = [],
        host = get(this, 'host'),
        prefix = this.urlPrefix();

    if (type) { url.push(this.pathForType(type)); }
    if (id) { url.push(id); }

    if (prefix) { url.unshift(prefix); }

    url = url.join('/');
    if (!host && url) { url = '/' + url; }

    return url;
  },

  /**
    @method urlPrefix
    @private
    @param {String} path
    @param {String} parentUrl
    @return {String} urlPrefix
  */
  urlPrefix: function(path, parentURL) {
    var namespace = get(this, 'namespace'),
        url = [];

    if (path) {
      // Absolute path
      if (path.charAt(0) === '/') {
      // Relative path
      } else if (!/^http(s)?:\/\//.test(path)) {
        url.push(parentURL);
      }
    } else {
      if (namespace) { url.push(namespace); }
    }

    if (path) {
      url.push(path);
    }

    return url.join('/');
  },

  /**
    Determines the pathname for a given type.

    By default, it pluralizes the type's name (for example,
    'post' becomes 'posts' and 'person' becomes 'people').

    ### Pathname customization

    For example if you have an object LineItem with an
    endpoint of "/line_items/".

    ```js
    DS.RESTAdapter.reopen({
      pathForType: function(type) {
        var decamelized = Ember.String.decamelize(type);
        return Ember.String.pluralize(decamelized);
      };
    });
    ```

    @method pathForType
    @param {String} type
    @returns {String} path
  **/
  pathForType: function(type) {
    var camelized = Ember.String.camelize(type);
    return Ember.String.pluralize(camelized);
  },

  request: function(path, type, hash){
    var client = this.get('client');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var subscriptionHeaders = {};
      client.subscribeOnce(path, subscriptionHeaders, function(payload) {
        resolve(payload);
      });

      client.set('errorHandler', reject);

      var headers = {
        action: type // GET, SET, UPDATE, DELETE
      }

      if (hash.data && type !== 'GET') {
        headers.contentType = 'application/json; charset=utf-8';
      }

      client.send(path, headers, JSON.stringify(hash.data));
    });
  },

  _connect: function(url){
    var client = Client.createWithAddress(this.get('socketEndpoint'));
    this.set('client', client);
  },
});

export default WebSocketAdapter;
