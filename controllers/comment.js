const commentRouter = require('express').Router()
const Comment = require('../models/comment')
const Event = require('../models/event')

commentRouter.get('/:eventId/comments', (request, response, next) => {
  Event.exists({ _id: request.params.eventId })
    .then(exits => {
      if (exits) {
        Comment
          .find({ eventId: request.params.eventId })
          .then(comments => {
            response.json(comments)
          })
          .catch(error => next(error))
      } else {
        response.status(404).json({ error: 'not found' })
      }
    })
    .catch(error => next(error))
})

commentRouter.get('/:eventId/comments/:id', (request, response, next) => {
  Event.exists({ _id: request.params.eventId })
    .then(exits => {
      if (exits) {
        Comment
          .findOne({ _id: request.params.id, eventId: request.params.eventId })
          .then(comment => {
            if (comment) {
              response.json(comment)
            } else {
              response.status(404).json({ error: 'not found' })
            }
          })
          .catch(error => next(error))
      } else {
        response.status(404).json({ error: 'not found' })
      }
    })
    .catch(error => next(error))
})

commentRouter.delete('/:eventId/comments/:id', (request, response, next) => {
  Event.exists({ _id: request.params.eventId })
    .then(exits => {
      if (exits) {
        Comment
          .findOneAndRemove({ _id: request.params.id, eventId: request.params.eventId })
          .then(() => {
            response.status(204).end()
          })
          .catch(error => next(error))
      } else {
        response.status(404).json({ error: 'not found' })
      }
    })
    .catch(error => next(error))
})

commentRouter.post('/:eventId/comments', (request, response, next) => {
  Event.exists({ _id: request.params.eventId })
    .then(exits => {
      if (exits) {
        const comment = new Comment(request.body)
        comment.createdTime = new Date()
        comment.eventId = request.params.eventId
        comment
          .save()
          .then(savedComment => {
            response.status(201).json(savedComment)
          })
          .catch(error => next(error))
      } else {
        response.status(404).json({ error: 'not found' })
      }
    })
    .catch(error => next(error))
})

module.exports = commentRouter