const mongoose = require('mongoose')

const NotFoundError = require('../shared/errors/NotFoundError')

const { type, message } = new NotFoundError('Invalid ID.')

/**
 * Checks if id in URL is a valid mongoDB objectId
 */
module.exports = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ type, message })
  }

  return next()
}
