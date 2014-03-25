/**
  @module realtime
*/

/**
  All Realtime methods and functions are defined inside of this namespace.

  @class Realtime
  @static
*/
var Realtime;
if ('undefined' === typeof Realtime) {
  /**
    @property VERSION
    @type String
    @default '<%= versionStamp %>'
    @static
  */
  Realtime = Ember.Namespace.create({
    VERSION: '<%= versionStamp %>'
  });

  if (Ember.libraries) {
    Ember.libraries.registerCoreLibrary('Realtime', Realtime.VERSION);
  }
}

export default Realtime;
