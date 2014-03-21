module.exports = {
  local: {
    options: {
      urls: [ 'http://localhost:9997/tests/index.html' ]
    },
    callback: function(err, res) {
      if (err) {
        console.log(err.toString(), err.stack)
      }
    }
  }
};
