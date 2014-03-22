var matchdep = require('matchdep');
module.exports = function(grunt){

  matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.loadTasks('tasks');
  var config = require('load-grunt-config')(grunt, {
    configPath: __dirname + '/tasks/options',
    init: false
  });

  config.pkg = require('./package');
  config.env = process.env;

  grunt.initConfig(config);

  grunt.registerTask('buildPackages', [
    'setVersionStamp',
    'clean',
    'transpile:amd',
    'concat:globals',
    'browser:dist',
    // 'jshint'
  ]);

  grunt.registerTask('prepareTests', ['buildPackages', 'concat:tests']);
  grunt.registerTask('test:server',  ['prepareTests', 'connect']);
  grunt.registerTask('test',         ['test:server', 'qunit:local']);

  grunt.registerTask('default', ['buildPackages']);
};
