var grunt = require('grunt');

module.exports = {
  amd: {
    src: [ 'tmp/**/*.amd.js' ],
    dest: 'tmp/web_socket_adapter.amd.js'
  },
  globals: {
    src: [ 'vendor/loader.js', 'tmp/**/*.amd.js' ],
    dest: 'tmp/web_socket_adapter.browser1.js'
  },
  tests: {
    src: [ 'packages/**/tests/**/*.js' ],
    dest: 'tmp/tests.js',
    options: {
      separator: ';\n',
      process: function(src, filepath){
        return "(function(){\n" + src + "\n})();";
      }
    }
  }
};
