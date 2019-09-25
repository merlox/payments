require('dotenv').config()
const { MONGO_URL, NODE_ENV, STRIPE_PRIVATE_LIVE, STRIPE_PRIVATE_TEST } = process.env
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const bodyParser = require('body-parser')
const database = require('./database.js')
const express = require('express')
const { join } = require('path')
const yargs = require('yargs')
const app = express()
const argv = yargs.option('port', {
    alias: 'p',
    description: 'Set the port to run this server on',
    type: 'number',
}).help().alias('help', 'h').argv
if(!argv.port) {
    console.log('Error, you need to pass the port you want to run this application on with npm start -- -p 8001')
    process.exit(0)
}
const port = argv.port
const paymentApi = require('./paymentApi.js')
let db = {}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
  secret: 'example-random-secret',
  store: new MongoStore({
    url: MONGO_URL,
  }),
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // One whole month
  },
  resave: true,
  unset: 'destroy',
  saveUninitialized: true,
}))

app.use('*', (req, res, next) => {
	// Logger
	let time = new Date()
	console.log(`${req.method} to ${req.originalUrl} at ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
	next()
})

// The payment API routes
app.use('/api', paymentApi)

// Compression request to send the valid build files
app.get('/build.js', (req, res) => {
	if (req.header('Accept-Encoding').includes('br')) {
		res.set('Content-Encoding', 'br')
		res.set('Content-Type', 'application/javascript; charset=UTF-8')
    console.log('...Sending BR...')
		return res.sendFile(join(__dirname, '../dist', 'build.js.br'))
	} else if(req.header('Accept-Encoding').includes('gz')) {
		res.set('Content-Encoding', 'gz')
		res.set('Content-Type', 'application/javascript; charset=UTF-8')
    console.log('...Sending GZIP...')
		return res.sendFile(join(__dirname, '../dist', 'build.js.gz'))
	}
})

app.use(express.static('dist'))

async function start () {
  if (!MONGO_URL) {
    return console.error('\nThe MONGO_URL .env variable must be set\n')
  } else if (!NODE_ENV) {
    return console.error('\nThe NODE_ENV .env variable must be set\n')
  } else if (!STRIPE_PRIVATE_LIVE) {
    return console.error('\nThe STRIPE_PRIVATE_LIVE .env variable must be set\n')
  } else if (!STRIPE_PRIVATE_TEST) {
    return console.error('\nThe STRIPE_PRIVATE_TEST .env variable must be set\n')
  }

  if (NODE_ENV == 'production') {
    console.log('Detected production environment: all payments will go live')
  } else {
    console.log('Detected development environment: all payments will go testing')
  }

  db = await database(MONGO_URL)
  app.listen(port, '0.0.0.0', (req, res) => {
  	console.log(`> Listening on localhost:${port}`)
  })
}

start()
