var Byte = {
  LF: '\x0A',
  NULL: '\x00'
};

var trim = String.prototype.trim;

function sizeOfUTF8(s) {
  if (s) {
    return encodeURI(s).split(/%..|./).length - 1;
  } else {
    return 0;
  }
};

/**
 * Represents a single deserialised STOMP frame
 *
 * @type {Ember.Object}
 * @expose
 * @public
 */

var Frame = Ember.Object.extend({
  /**
   * Frame body
   *
   * @type {String}
   * @public
   * @expose
   */
  body: null,

  headers: {},

  init: function(){
    if (!this.get('headers')) { this.set('headers', {}) }
    if (!this.get('body')) { this.set('body', '') }
  },

  marshal: function(){
    var lines, name, value, _ref;
    lines = [this.command];
    _ref = this.get('headers');

    var body = this.get('body');
    if (typeof body !== 'string') {
      body = JSON.stringify(body);
      _ref['content-type'] = 'application/json';
    }

    for (name in _ref) {
      if (!_ref.hasOwnProperty(name)) continue;
      value = _ref[name];
      lines.push("" + name + ":" + value);
    }

    if (body) {
      lines.push("content-length:" + (sizeOfUTF8(body)));
    }
    lines.push(Byte.LF + body);
    return lines.join(Byte.LF) + Byte.NULL;
  },

  unmarshal: function(bytes){
    var divider, headers, headerLines, command,
        _ref, idx, len, body, chr, _j, start;

    divider = bytes.search(RegExp('' + Byte.LF + Byte.LF));
    headerLines = bytes.substring(0, divider).split(Byte.LF);
    command = headerLines.shift();
    headers = {};
    _ref = headerLines.reverse();
    headerLines.forEach(function(line) {
      idx = line.indexOf(':');
      headers[line.substring(0, idx).toString().trim()] = line.substring(idx + 1).toString().trim();
    });
    body = '';
    start = divider + 2;

    if (headers['content-length']) {
      len = parseInt(headers['content-length']);
      body = ('' + bytes).substring(start, start + len);
    }else{
      chr = null;
      for (var i = _j = start, _ref1 = bytes.length; start <= _ref1 ? _j < _ref1 : _j > _ref1; i = start <= _ref1 ? ++_j : --_j) {
        chr = bytes.charAt(i);
        if (chr === Byte.NULL) {
          break;
        }
        body += chr;
      }
    }

    if (headers.hasOwnProperty('content-type') &&
        /json/.test('' + headers['content-type'])) {
      body = JSON.parse(body);
    }

    this.set('headers', headers);
    this.set('command', command);
    this.set('body', body);
  },

})

Frame.reopenClass({
  createWithCommand: function(command, headers, body){
    return Frame.create({
      command: command,
      headers: headers,
      body: body
    });
  },
})

Frame.Byte = Byte;

export default Frame;