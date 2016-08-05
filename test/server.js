import 'utilise'
import rijs from './rijs'
import popper from 'popper'
import devnull from 'dev-null'

// the popper js api returns a ripple instance 
// which we can later extend with more resources
const ripple = popper({
    watch: '.'
  , ripple: rijs
  , runner: 'tape'
  , browsers: ['ie11', 'chrome', 'firefox']
  , port: 1945
  , tests: `browserify ./test/client.js \
      -t babelify \
      -t tapify \
      -i socket.io \
      -i socket.io-client \
      -i socket.io-stream \
      | sed -E \"s/require\\('socket\\.io-stream'\\)/window.ss/g\"`
  // socket.io{-stream} does not play well in browserify
  // so we include these as globals
  , globals: `
      <script src="socket.io/socket.io.js"></script>
      <script src="https://npmcdn.com/socket.io-stream/socket.io-stream.js"></script>
    `
  })
      
// register a resource
ripple('events', [], { from })

// request handler
function from(req, res){
  // ignore all other requests to this resource
  if (req.type !== 'upload') return

  // pipe the photos somewhere
  req.value
    .photos[0]
    .pipe(devnull())
    .on('finish', finish)

  function finish() {
    if (req.value.name !== 'foo') 
      throw new Error('name not as expected')

    if (req.value.photos.length !== 1) 
      throw new Error('photos not as expected')

    res([200, 'ok'])
  }
}