const router = require('express').Router()
import auth from '../../middleware/auth'
import users from '../controllers/users'
import { APIError } from '../../shared/errors/APIError'
import { logger } from '../../config/logger'
import config from '../../config/config.js'
import { Request } from 'express'
import admin from '../../middleware/admin'
import validateObjectId from '../../middleware/validateObjectId'
import { AppResponse } from '../../../app'

/**
 * Get user data
 */
router.get('/me', auth, (_req: Request, res: AppResponse) => {
  logger.info('ME_REQUEST', { user: res.locals.user?.email })
  const user = users.getMe(res.locals.user)
  logger.info('ME_REQUEST_SUCCEEDED', { user: user.email })
  res.status(200).send(user)
})

/**
 * Patch logged user
 */
router.patch('/me', auth, async (req: Request, res: AppResponse) => {
  logger.info('PATCH_ME_REQUEST', { user: res.locals.user.email })
  try {
    const user = await users.patchMe(res.locals.user, req.body)
    logger.info('PATCH_ME_SUCCEEDED', { user: res.locals.user.email })
    res.status(200).send(user)
  } catch (e: any) {
    if (e instanceof APIError) {
      const { type, message } = e
      logger.info('PATCH_ME_FAILED', { type, email: res.locals.user.email })
      res.status(400).send({ type, message: req.t(message) })
    } else {
      logger.error('PATCH_ME_FAILED', e)
      res.status(500).send()
    }
  }
})

/**
 * Get all users
 */
router.get('/', [auth, admin], async (req: Request, res: AppResponse) => {
  logger.info('USERS_REQUEST')
  try {
    const result = await users.all()
    logger.info('USERS_SUCCEEDED', { users: result.length })
    res.status(200).send(result)
  } catch (e: any) {
    logger.error('USERS_FAILED', e)
    res.status(500).send()
  }
})

/**
 * Register a new user
 */
router.post('/', async (req: Request, res: AppResponse) => {
  logger.info('CREATE_USER_REQUEST', { email: req.body.email })
  try {
    const { token, email, refreshToken } = await users.register(req.body)
    logger.info('CREATE_USER_SUCCEDED', { email })
    res
      .cookie(config.refreshToken.name, refreshToken, {
        httpOnly: true,
        maxAge: config.refreshToken.expiresInSec * 1000,
        secure: process.env.NODE_ENV === 'production'
      })
      .status(201)
      .send({ email, token })

  } catch (e: any) {
    if (e instanceof APIError) {
      const { type, message } = e
      logger.info('CREATE_USER_FAILED', { type, email: req.body.email })
      res.status(400).send({ type, message: req.t(message) })
    } else {
      logger.error('CREATE_USER_FAILED', e)
      res.status(500).send()
    }

  }
})

/**
 * Patch user
 */
router.patch('/:id', [auth, admin, validateObjectId], async (req: Request, res: AppResponse) => {
  const { id } = req.params
  logger.info('PATCH_USER_REQUEST', { user: id })
  try {
    const user = await users.patch(id, req.body)
    logger.info('PATCH_USER_SUCCEEDED', { user: id })
    res.status(200).send(user)
  } catch (e: any) {
    if (e instanceof APIError) {
      const { type, message } = e
      logger.info('PATCH_USER_FAILED', { type, user: id })
      res.status(400).send({ type, message: req.t(message) })
    } else {
      logger.error('PATCH_USER_FAILED', e)
      res.status(500).send()
    }
  }
})

export default router
