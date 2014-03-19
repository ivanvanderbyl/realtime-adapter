function nameFor(path) {
  console.log(path)
  var result,  match;

  if (match = path.match(/^(?:lib|test|test\/tests)\/(.*?)(?:\.js)(?:\.es6)?$/)) {
    result = match[1];
  } else {
    result = path;
  }

  return path;
}

module.exports = {
  amd: {
    type: 'amd',
    moduleName: nameFor,
    files: [{
      expand: true,
      cwd: 'lib',
      src: [ '**/*.js.es6', ],
      dest: 'tmp',
      ext: '.amd.js'
    }]
  }
};

