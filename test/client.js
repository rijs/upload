import 'utilise'
import rijs from './rijs'
const ripple = rijs()
    , test = require('tap').test

test('api', t => {
  t.plan(2)
  t.same(typeof ripple.upload, 'function')
  t.same(typeof ripple.upload.log, 'object')
})

test('upload', t => {
  // t.plan(2)
  const form = once(document.body)('form', 1)
      , canvas = form('canvas', 1).node().toBlob(createBlob)

  function createBlob(file) {
    t.plan(3)

    // you would normally create this object from a HTML form
    // (see https://github.com/utilise/utilise#--form)
    // since we can't programmatically manipulate input[type="file"]
    // we mimic the same
    const photos = [file]
        , forms = { name: 'foo', photos }
    photos.__proto__ = FileList.prototype
    file.name = 'photo.jpg'
    
    // upload the form and listen for updates
    ripple.upload('events', form)
      .on('progress.event', progress =>
        t.ok(progress > 0 && progress < 100, 'progress is number')
      )
      .on('response.event', ([status, message]) => {
        t.same(status, 200, 'status 200')
        t.same(message, 'ok', 'message ok')
        form.remove()
      })
  }
})