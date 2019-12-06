const mongoose = require('mongoose')

const eventSchema = mongoose.Schema({
  name: String,
  location: String,
  time: Date,
  description: String,
  participants: Number,
  createdTime: Date
})

eventSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Event', eventSchema)