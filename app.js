/**
 * Express ilmoitustaulu back-end sovellus.
 * @module app
 * @version 1.0.0
 * @author mika
 */

const config = require('./utils/config')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')
const eventRouter = require('./controllers/event')
const commentRouter = require('./controllers/comment')

/**
 * @const {string} - Mongo database url.
 */
const mongoUrl = config.MONGODB_URI
mongoose.set('useFindAndModify', false)
mongoose.set('useUnifiedTopology', true)
mongoose.connect(mongoUrl, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to db')
  })
  .catch((error) => {
    console.log('error connecting to db', error.message)
  })

app.use(cors()) //Cross-Origin Resource Sharing.
app.use(bodyParser.json()) //Parse incoming request bodies.
morgan.token('body', req => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body')) //Request logger.

app.use('/api/events', eventRouter)
app.use('/api/events', commentRouter)
app.get('/', (request, response) => {
  response.send('hello')
})

/**
 * Midleware huonoihin pyyntöihin vastaamiseksi.
 */
const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    response.status(400).send({ error: 'malformed id' })
    return
  } else if (error.name === 'ValidationError') {
    response.status(400).json({ error: error.message })
    return
  }
  next(error)
}

/**
 * Olemattomien osoitteiden käsittely.
 * @param {*} request 
 * @param {object} response - Tulleen pyynnön vastaus
 */
const unknownEndpoint = (request, response) => {
  response.status(404).end()
}

app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app