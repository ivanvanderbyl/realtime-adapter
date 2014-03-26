module.exports = function (broccoli) {
  // var uglifyJavaScript = require('broccoli-uglify-js')
  var closureCompiler = require('broccoli-closure-compiler')
  var compileES6 = require('broccoli-es6-concatenator')
  var env = require('broccoli-env').getEnv()

  var packages = broccoli.makeTree('packages')
  var vendor = broccoli.makeTree('vendor')

  var sourceTrees = [packages, vendor]
  sourceTrees = sourceTrees.concat(broccoli.bowerTrees())
  var appAndDependencies = new broccoli.MergedTree(sourceTrees)

  var appJs = compileES6(appAndDependencies, {
    loaderFile: 'loader.js',
    ignoredModules: [
      'ember/resolver'
    ],
    inputFiles: [
      'realtime-adapter/lib/**/*.js'
    ],
    legacyFilesToAppend: [
      'jquery.js',
      'handlebars.js',
      'ember.js',
      'ember-data.js',
      'ember-resolver.js'
    ],
    wrapInEval: false,
    outputFile: '/assets/app.js'
  })

  appJs = closureCompiler(appJs, {
    language_in: 'ECMASCRIPT5',
    compilation_level: 'ADVANCED_OPTIMIZATIONS'
  });

  return [appJs]
};