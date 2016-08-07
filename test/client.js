import rijs from './rijs'
const ripple = rijs()
    , test = require('tap').test

test('api', t => {
  t.plan(2)
  t.same(typeof ripple.upload, 'function')
  t.same(typeof ripple.upload.log, 'object')
})

test('upload', t => {
  t.plan(3)

  const base64 = 
    "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB1klEQVR42n2TzytEURTHv3e8N1joRhZG" + 
    "zJsoCjsLhcw0jClKWbHwY2GnLGUlIfIP2IjyY2djZTHSMJNQSilFNkz24z0/Ms2MrnvfvMu8mcfZvPvu" + 
    "Pfdzz/mecwgKLNYKb0cFEgXbRvwV2s2HuWazCbzKA5LvNecDXayBjv9NL7tEpSNgbYzQ5kZmAlSXgsGG" + 
    "XmS+MjhKxDHgC+quyaPKQtoPYMQPOh5U9H6tBxF+Icy/aolqAqLP5wjWd5r/Ip3YXVILrF4ZRYAxDhCO" + 
    "J/yCwiMI+/xgjOEzmzIhAio04GeGayIXjQ0wGoAuQ5cmIjh8jNo0GF78QwNhpyvV1O9tdxSSR6PLl51F" + 
    "nIK3uQ4JJQME4sCxCIRxQbMwPNSjqaobsfskm9l4Ky6jvCzWEnDKU1ayQPe5BbN64vYJ2vwO7CIeLIi3" + 
    "ciYAoby0M4oNYBrXgdgAbC/MhGCRhyhCZwrcEz1Ib3KKO7f+2I4iFvoVmIxHigGiZHhPIb0bL1bQApFS" + 
    "9U/AC0ulSXrrhMotka/lQy0Ic08FDeIiAmDvA2HX01W05TopS2j2/H4T6FBVbj4YgV5+AecyLk+Ctvms" + 
    "QWK8WZZ+Hdf7QGu7fobMuZHyq1DoJLvUqQrfM966EU/qYGwAAAAASUVORK5CYII="
  
  const binary = fixBinary(atob(base64))
      , file = new Blob([binary], {type: 'image/png'})

  // you would normally create this object from a HTML form
  // (see https://github.com/utilise/utilise#--form)
  // since we can't programmatically manipulate input[type="file"]
  // we mimic the same
  const photos = [file]
      , form = { name: 'foo', photos }
  photos.__proto__ = FileList.prototype
  
  // upload the form and listen for updates
  ripple.upload('events', form)
    .on('progress.event', progress => {
      t.ok(progress >= 0 && progress <= 100, 'progress is number')
    })
    .on('response.event', ([status, message]) => {
      t.same(status, 200, 'status 200')
      t.same(message, 'ok', 'message ok')
    })
})

function fixBinary (bin) {
  var length = bin.length;
  var buf = new ArrayBuffer(length);
  var arr = new Uint8Array(buf);
  for (var i = 0; i < length; i++) {
    arr[i] = bin.charCodeAt(i);
  }
  return buf;
}