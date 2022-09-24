const router = require('express').Router()
const auth = require('../../middleware/auth')
const users = require('../controllers/users')
const APIError = require('../../shared/errors/APIError')
const logger = require('../../config/logger')

const {
  refreshToken: { name: rTokenName, expiresIn: rTokenExpiration }
} = require('../../config/config')
const admin = require('../../middleware/admin')
const validateObjectId = require('../../middleware/validateObjectId')

/**
 * Get user data
 */
router.get('/me', auth, (req, res) => {
  logger.info('ME_REQUEST', { user: req.user.email })
  const user = users.getMe(req.user)
  logger.info('ME_REQUEST_SUCCEEDED', { user: user.email })
  res.status(200).send(user)
})

/**
 * Patch logged user
 */
router.patch('/me', auth, (req, res) => {
  logger.info('PATCH_ME_REQUEST', { user: req.user.email })
  users
    .patchMe(req.user, req.body)
    .then((user) => {
      logger.info('PATCH_ME_SUCCEEDED', { user: req.user.email })
      res.status(200).send(user)
    })
    .catch((error) => {
      if (error instanceof APIError) {
        const { type, message } = error
        logger.info('PATCH_ME_FAILED', { type, email: req.user.email })
        res.status(400).send({ type, message: req.t(message) })
      } else {
        logger.error('PATCH_ME_FAILED', error)
        res.status(500).send()
      }
    })
})

/**
 * Get all users
 */
router.get('/', [auth, admin], (req, res) => {
  logger.info('USERS_REQUEST')
  users
    .all()
    .then((result) => {
      logger.info('USERS_SUCCEEDED', { users: result.length })
      res.status(200).send(result)
    })
    .catch((error) => {
      logger.error('USERS_FAILED', error)
      res.status(500).send()
    })
})

/**
 * Register a new user
 */
router.post('/', (req, res) => {
  logger.info('CREATE_USER_REQUEST', { email: req.body.email })
  users
    .register(req.body)
    .then(({ token, email, refreshToken }) => {
      logger.info('CREATE_USER_SUCCEDED', { email })
      res
        .cookie(rTokenName, refreshToken, {
          httpOnly: true,
          maxAge: rTokenExpiration * 1000,
          secure: process.env.NODE_ENV === 'production'
        })
        .status(201)
        .send({ email, token })
    })
    .catch((error) => {
      if (error instanceof APIError) {
        const { type, message } = error
        logger.info('CREATE_USER_FAILED', { type, email: req.body.email })
        res.status(400).send({ type, message: req.t(message) })
      } else {
        logger.error('CREATE_USER_FAILED', error)
        res.status(500).send()
      }
    })
})

/**
 * Patch user
 */
router.patch('/:id', [auth, admin, validateObjectId], (req, res) => {
  const { id } = req.params
  logger.info('PATCH_USER_REQUEST', { user: id })
  users
    .patch(id, req.body)
    .then((user) => {
      logger.info('PATCH_USER_SUCCEEDED', { user: id })
      res.status(200).send(user)
    })
    .catch((error) => {
      if (error instanceof APIError) {
        const { type, message } = error
        logger.info('PATCH_USER_FAILED', { type, user: id })
        res.status(400).send({ type, message: req.t(message) })
      } else {
        logger.error('PATCH_USER_FAILED', error)
        res.status(500).send()
      }
    })
})

module.exports = router
