const config = require('./utils/config')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const eventRouter = require('./controllers/event')
const commentRouter = require('./controllers/comment')

const mongoUrl = config.MONGODB_URI
mongoose.set('useFindAndModify', false)
mongoose.set('useUnifiedTopology', true)
mongoose.connect(mongoUrl, { useNewUrlParser: true })

app.use(cors())
app.use(bodyParser.json())

app.use('/api/events', eventRouter)
app.use('/api/events', commentRouter)
app.get('/info', (request, response) => {
    response.send('hello')
    console.log('4040404044')
})

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

app.use(errorHandler)

console.log('hello worrld')

module.exports = app