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
    // 'clean',
    'transpile:amd',
    'concat:globals',
    'browser:dist',
    // 'jshint'
  ]);

  grunt.registerTask('default', ['buildPackages']);

};