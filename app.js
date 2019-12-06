const config = require('./utils/config')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const eventRouter = require('./controllers/event')

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl, { useNewUrlParser: true })


app.use(cors())

app.use(bodyParser.json())

app.use('/api/events', eventRouter)
app.get('/info', (request, response) => {
    response.send('hello')
    console.log('4040404044')
})

console.log('hello worrld')

module.exports = app