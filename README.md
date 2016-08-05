# Ripple | Upload
[![Coverage Status](https://coveralls.io/repos/rijs/upload/badge.svg?branch=master&service=github)](https://coveralls.io/github/rijs/upload?branch=master)
[![Build Status](https://travis-ci.org/rijs/upload.svg)](https://travis-ci.org/rijs/upload)

This module aims to make uploading forms nicer to deal with. Given a `<form>`, you can get a sensible JSON object on the server side where the keys are the `[name]` attribute of each control. In particlar, it turns `type="file"` elements into an array of native Streams (with backpressure and all) so you can then simply pipe them.

First, use [utilise/form](https://github.com/utilise/utilise#--form) to turn your form element into a simple plain JSON object.

```js
const { values } = form(formElement)
```

Then upload. You get two events for updates: `progress` and `response`.

```js
ripple.upload('resource', values)
  .on('progress', progress => ...)
  .on('progress', response => ...)
```

The `resource` identifies which handler to use on the server-side. For example, let's say you registered an `events` resource, then its `from` function would receive the upload. Complete example below and [see the example/test for a real example](https://github.com/rijs/upload/blob/master/test):

```html
<form>
  <input type="text" name="title">
  <input type="file" name="photos"> 
</form>
```

```js

// server
ripple('events', [], { from })

function from(req, res){
  if (!req.type == 'upload') return

  // req.value contains everything you need to process
  req.value == {
    name: ... // some text
    photos: [...] // An array of streams, one for each file
  }

  // Use res to respond directly to the upload. 
  // You can pass any arguments you like.
  // This is what the "response" event on the client receives
  if (success) 
    res(200, '/event/123')
  else
    res(500, 'error')
}

// client
const { values } = form(formElement)

ripple.upload('events', values)
  .on('progress', progress => {
    swal({
      title: 'Uploading Event..'
    , content: progress + '%'
    , type: 'working'
    })
  })
  .on('response', (status, url) => {
    const title   = status == 200 ? 'Done' : 'Error'
        , type    = status == 200 ? 'success' : 'error' 
        , content = status == 200 
            ? 'Great - Your event has now been published!'
            : 'Uh oh, something went wrong! Please try again later'
        , buttons = [{ type: 'primary', text: 'Close' }]

    go(url)
    swal({ title, type, content, buttons })
  })
```

(NB: `swal` comes from [pemrouz/sweet-alert](https://github.com/pemrouz/sweet-alert) and `go` from [pemrouz/decouter](https://github.com/pemrouz/decouter))