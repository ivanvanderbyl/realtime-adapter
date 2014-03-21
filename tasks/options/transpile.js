function nameFor(path) {
  var result,  match;

  if (match = path.match(/^(?:lib|test|test\/tests)\/(.*?)(?:\.js)?$/)) {
    result = match[1];
  } else {
    result = path;
  }
  console.log(result)

  return result;
}

module.exports = {
  amd: {
    type: 'amd',
    moduleName: nameFor,
    files: [{
      expand: true,
      cwd: 'packages/',
      src: [ '**/lib/**/*.js', ],
      dest: 'tmp',
      ext: '.amd.js'
    }]
  }
};

