const router = require('express').Router()
const auth = require('../controllers/auth')
const APIError = require('../../shared/errors/APIError')
const logger = require('../../config/logger')
const MissingTokenError = require('../../shared/errors/AuthorizationError/MissingTokenError')
const InvalidTokenError = require('../../shared/errors/AuthorizationError/InvalidTokenError')

const { NODE_ENV } = process.env
const {
  refreshToken: { name: rTokenName, expiresIn: rTokenExpiration }
} = require('../../config/config')

/**
 * Login the user
 */
router.post('/', (req, res) => {
  logger.info('AUTHENTICATION_REQUEST', { email: req.body.email })
  auth
    .authenticate(req.body)
    .then(({ token, refreshToken }) => {
      logger.info('AUTHENTICATION_SUCCEDED', { email: req.body.email })
      res
        .cookie(rTokenName, refreshToken, {
          httpOnly: true,
          maxAge: rTokenExpiration * 1000,
          secure: NODE_ENV === 'production'
        })
        .status(200)
        .send({ token })
    })
    .catch((error) => {
      if (error instanceof APIError) {
        const { type, message } = error
        logger.info('AUTHENTICATION_FAILED', { email: req.body.email, type })
        res.status(400).send({ type, message: req.t(message) })
      } else {
        logger.error('AUTHENTICATION_FAILED', error)
        res.status(500).send()
      }
    })
})

/**
 * Logout the user
 */
router.delete('/', (req, res) => {
  logger.info('LOGOUT_REQUEST')
  auth
    .logout(req.cookies)
    .then(() => {
      logger.info('LOGOUT_SUCCEEDED')
      res
        .clearCookie(rTokenName, {
          httpOnly: true,
          secure: NODE_ENV === 'production'
        })
        .sendStatus(204)
    })
    .catch((error) => {
      logger.error('LOGOUT_FAILED', error)
      res.status(500).send()
    })
})

/**
 * Refresh access token
 */
router.post('/refresh', (req, res) => {
  logger.info('AUTH_REFRESH_REQUEST')
  auth
    .refresh(req.cookies)
    .then((data) => {
      logger.info('AUTH_REFRESH_SUCCEEDED')
      res.status(200).send(data)
    })
    .catch((error) => {
      if (error instanceof MissingTokenError) {
        logger.info('AUTH_REFRESH_FAILED')
        res.status(401).send({ message: req.t(error.message) })
      } else if (error instanceof InvalidTokenError) {
        logger.info('AUTH_REFRESH_FAILED')
        res.status(403).send({ message: req.t(error.message) })
      } else {
        logger.error('AUTH_REFRESH_FAILED', error)
        res.status(500).send()
      }
    })
})

/**
 * Forgot password
 */
router.post('/forgotPassword', (req, res) => {
  logger.info('FORGOT_PASSWORD_REQUEST', { body: req.body })
  auth
    .forgotPassword(req.body, req.t)
    .then((message) => {
      logger.info('FORGOT_PASSWORD_SUCCEDED', { email: req.body.email })
      res.status(200).send(message)
    })
    .catch((err) => {
      logger.error('FORGOT_PASSWORD_FAILED', { body: req.body, err })
      if (err instanceof APIError) {
        const { type, message } = err
        res.status(400).send({ type, message: req.t(message) })
      } else {
        res.status(500).send()
      }
    })
})

/**
 * Reset password
 */
router.patch('/resetPassword/:token', (req, res) => {
  logger.info('RESET_PASSWORD_REQUEST', {
    token: req.params.token
  })
  auth
    .resetPassword(req.body, req.params.token)
    .then(({ email, token, refreshToken }) => {
      logger.info('RESET_PASSWORD_SUCCEDED', { user: email })
      res
        .cookie(rTokenName, refreshToken, {
          httpOnly: true,
          maxAge: rTokenExpiration * 1000,
          secure: NODE_ENV === 'production'
        })
        .status(200)
        .send({ email, token })
    })
    .catch((err) => {
      logger.error('RESET_PASSWORD_FAILED', { err })
      if (err instanceof APIError) {
        const { type, message } = err
        res.status(400).send({ type, message: req.t(message) })
      } else {
        res.status(500).send()
      }
    })
})

module.exports = router
