const { verify: jwtVerify } = require('../shared/jwt')
const { User } = require('../api/models/User')
const MissingTokenError = require('../shared/errors/AuthorizationError/MissingTokenError')
const InvalidTokenError = require('../shared/errors/AuthorizationError/InvalidTokenError')
const logger = require('../config/logger')
const InvalidDataError = require('../shared/errors/InvalidDataError')

const { JWT_PRIVATE_KEY } = process.env
const {
  accessToken: { name: aTokenName }
} = require('../config/config')

const auth = async (req, res, next) => {
  try {
    const header = req.header(aTokenName)
    const token = header && header.replace('Bearer ', '')
    if (!token) {
      throw new MissingTokenError()
    }

    const { data, expired, valid } = jwtVerify(token, JWT_PRIVATE_KEY)
    if (expired || !valid) {
      throw new InvalidTokenError()
    }

    const user = await User.findOne({ _id: data.user })
    if (!user) {
      throw new InvalidDataError()
    }

    req.user = user
    req.token = token
    logger.info('USER_AUTHORIZED', { user: user.email })
    next()
  } catch (error) {
    if (error instanceof MissingTokenError) {
      logger.info('AUTHORIZATION_FAILED')
      res.status(401).send({ type: error.type, message: error.message })
    } else {
      logger.info('AUTHORIZATION_FAILED')
      res.status(403).send({ type: error.type, message: error.message })
    }
  }
}
module.exports = auth
