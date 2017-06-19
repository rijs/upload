'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = upload;

var _emitterify = require('utilise/emitterify');

var _emitterify2 = _interopRequireDefault(_emitterify);

var _values = require('utilise/values');

var _values2 = _interopRequireDefault(_values);

var _client = require('utilise/client');

var _client2 = _interopRequireDefault(_client);

var _keys = require('utilise/keys');

var _keys2 = _interopRequireDefault(_keys);

var _key = require('utilise/key');

var _key2 = _interopRequireDefault(_key);

var _to = require('utilise/to');

var _to2 = _interopRequireDefault(_to);

var _socket = require('socket.io-stream');

var _socket2 = _interopRequireDefault(_socket);

/* istanbul ignore next */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -------------------------------------------
// Streams Forms
// -------------------------------------------
function upload(ripple) {
  log('creating');

  if (_client2.default) {
    ripple.upload = up(ripple), ripple;
    ripple.upload.log = [];
  } else {
    ripple.io.on('connection', connected(ripple, _socket2.default));
  }

  return ripple;
}

var connected = function connected(ripple, ss) {
  return function (socket) {
    socket.on('upload', function (meta, res) {
      var id = socket.ip + '-' + meta.time;
      log('uploading form', id);
      meta.res = res;
      buffer[id] = meta;
      if (!(0, _values2.default)(meta.files).some(Boolean)) end(socket, id);
    });

    ss(socket).on('file', function (stream, data) {
      var filename = data.filename;
      var size = data.size;
      var name = data.name;
      var i = data.i;
      var time = data.time;
      var id = socket.ip + '-' + time;
      var _buffer$id = buffer[id];
      var files = _buffer$id.files;
      var fields = _buffer$id.fields;
      var resource = _buffer$id.resource;


      fields[name][i] = stream;
      if (fields[name].filter(Boolean).length == files[name]) delete files[name];
      if (!(0, _values2.default)(files).some(Boolean)) end(socket, id);
    });

    var end = function end(socket, id) {
      var _buffer$id2 = buffer[id];
      var resource = _buffer$id2.resource;
      var fields = _buffer$id2.fields;
      var time = _buffer$id2.time;
      var res = _buffer$id2.res;
      var from = (0, _key2.default)('resources.' + resource + '.headers.from')(ripple);

      log('finished', id, time);
      if (!from) return err('no handler for', resource);
      from({ name: resource, type: 'UPLOAD', value: fields, socket: socket }, res);
      delete buffer[id];
    };
  };
};

var up = function up(ripple) {
  return function (resource, data) {
    var files = {},
        fields = {},
        ret = (0, _emitterify2.default)({}),
        time = ripple.upload.log.push(ret) - 1,
        meta = { files: files, fields: fields, resource: resource, time: time },
        count = function count(d) {
      return totalSize += d.size;
    };

    var totalSize = 0,
        uploadedSize = 0;

    (0, _keys2.default)(data).map(function (name) {
      return data[name] instanceof FileList ? (files[name] = _to2.default.arr(data[name]).map(count).length, fields[name] = []) : fields[name] = data[name];
    });

    log('uploading form', meta, totalSize);
    ripple.io.emit('upload', meta, done);

    (0, _keys2.default)(files).map(function (name) {
      var i = files[name];
      while (i--) {
        var file = data[name][i],
            size = file.size,
            filename = file.name,
            stream = _socket2.default.createStream();

        (0, _socket2.default)(ripple.io).emit('file', stream, { filename: filename, size: size, name: name, i: i, time: time });
        _socket2.default.createBlobReadStream(file).on('data', function (chunk) {
          uploadedSize += chunk.length;
          ret.emit('progress', ~~(uploadedSize / totalSize * 100));
        }).pipe(stream);
      }
    });

    function done() {
      log('uploaded', time, arguments);
      ret.emit('response', _to2.default.arr(arguments));
      delete ripple.upload.log[time];
    }

    return ret;
  };
};

var log = require('utilise/log')('[ri/upload]'),
    err = require('utilise/err')('[ri/upload]'),
    buffer = {};