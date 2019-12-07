const mongoose = require('mongoose')

const eventSchema = mongoose.Schema({
  name: {type: String, required: true, trim: true, minlength: 1},
  location: {type: String, required: true, trim: true, minlength: 1},
  time: {type: Date, required: true},
  description: {type: String, required: true, trim: true, minlength: 1},
  participants: {type: Number, default: 0, min: 0},
  createdTime: {type: Date, default: Date}
})

eventSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Event', eventSchema)