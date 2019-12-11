/**
 * Mongoose model Comment konstruktori validioi tapahtumat ja määrittää niiden muodon.
 * @module models/comment
 */

const mongoose = require('mongoose')

/**
 * @const {object} commentSchema Kommentin mongoose skeema. Määrittää validoinnin kommenteille.
 */
const commentSchema = mongoose.Schema({
  author: {type: String, required: true, trim: true, minlength: 1},
  message: {type: String, required: true, trim: true, minlength: 1},
  createdTime: {type: Date, default: Date},
  eventId: String
})

commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.eventId
  }
})

module.exports = mongoose.model('Comment', commentSchema)