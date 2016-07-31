// -------------------------------------------
// Streams Forms
// -------------------------------------------
export default function upload(ripple) {
  log('creating')

  if (client) {
    ripple.upload = up(ripple), ripple
    ripple.upload.log = []
  } else {
    ripple.io.on('connection', connected(require('socket.io-stream')))
  }

  return ripple
}

const connected = ss => socket => {  
  socket.on('upload', (meta, res) => {
    const id = `${socket.ip}-${meta.time}`
    log('uploading form', id)
    meta.res = res
    buffer[id] = meta
    if (!values(meta.files).some(Boolean)) end(socket, id)
  })

  ss(socket).on('file', (stream, data) => {
    const { filename, size, name, i, time } = data
        , id = `${socket.ip}-${time}`
        , { files, fields, resource } = buffer[id]

    fields[name][i] = stream
    if (fields[name].filter(Boolean).length == files[name]) delete files[name]
    if (!values(files).some(Boolean)) end(socket, id)
  })

  const end = (socket, id) => {
    const type     = 'upload'
        , resource = buffer[id].resource
        , value    = buffer[id].fields
        , time     = buffer[id].time
        , res      = buffer[id].res
        , from     = key(`resources.${resource}.headers.from`)(ripple)
        , { name } = resource

    log('finished', id, time)
    if (!from) return err('no handler for', resource)
    from({ name, type, value, socket }, res)
    delete buffer[id]
  }
}

const up = ripple => (resource, data) => {
  const files = {}
      , fields = {}
      , ret = emitterify({})
      , time = ripple.upload.log.push(ret) - 1
      , meta = { files, fields, resource, time }
      , count = d => totalSize += d.size

  let totalSize = 0
    , uploadedSize = 0

  keys(data)
    .map(name => data[name] instanceof FileList
      ? (files[name] = to.arr(data[name]).map(count).length, fields[name] = [])
      : (fields[name] = data[name]))

  log('uploading form', meta, totalSize)
  ripple.io.emit('upload', meta, done)
  
  keys(files)
    .map(name => {
      let i = files[name]
      while (i--) {
        const file = data[name][i]
            , size = file.size
            , filename = file.name
            , stream = ss.createStream()

        ss(ripple.io).emit('file', stream, { filename, size, name, i, time })
        ss.createBlobReadStream(file)
          .on('data', function(chunk) {
            uploadedSize += chunk.length
            ret.emit('progress', ~~(uploadedSize / totalSize * 100))
          })
          .pipe(stream)
      }
    })

  function done() {
    log('uploaded', time, arguments)
    ret.emit('response', arguments)
    delete ripple.upload.log[time]
  }

  return ret
}

import emitterify from 'utilise/emitterify'
import values from 'utilise/values'
import client from 'utilise/client'
import keys from 'utilise/keys'
import key from 'utilise/key'
import to from 'utilise/to'

const log = require('utilise/log')('[ri/upload]')
    , err = require('utilise/err')('[ri/upload]')
    , buffer = {}