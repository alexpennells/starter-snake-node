const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const { Snek } = require('./snek.js')
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  return response.json({
    color: '#ff3377',
    headType: 'silly',
    tailType: 'bolt',
  })
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  try {
    const snek = new Snek(request);
    return response.json(snek.move());
  } catch (e) {
    console.log(e);
    return response.json({ move: 'up' });
  }
})

app.post('/end', (request, response) => {
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
