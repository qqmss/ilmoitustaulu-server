const eventRouter = require('express').Router()
const Event = require('../models/event')

eventRouter.get('/', (request, response, next) => {
  Event
    .find({})
    .then(events => {
      response.json(events)
    })
    .catch(error => next(error))
})

eventRouter.get('/:id', (request, response, next) => {
  Event
    .findById(request.params.id)
    .then(blog => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).json({ error: 'not found' })
      }
    })
    .catch(error => next(error))
})

eventRouter.put('/:id', (request, response, next) => {
  Event
    .findByIdAndUpdate(request.params.id, request.body, { new: true })
    .then(blog => {
      if (blog) {
        response.send(blog)
      } else {
        response.status(404).json({ error: 'not found' })
      }
    })
    .catch(error => next(error))
})

eventRouter.post('/', (request, response, next) => {
  const event = new Event(request.body)
  event.createdTime = new Date()
  event
    .save()
    .then(savedBlog => {
      response.status(201).json(savedBlog)
    })
    .catch(error => next(error))
})

eventRouter.delete('/:id', (request, response, next) => {
  console.log(request.params.id)
  Event
    .findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})



module.exports = eventRouter