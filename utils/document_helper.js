const Event = require('../models/event')
const Commment = require('../models/comment')

const getEventCount = () => Event.countDocuments({})
const getCommentCount = () => Commment.countDocuments({})

module.exports = {getEventCount, getCommentCount}
