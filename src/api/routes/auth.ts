import auth from '../controllers/auth'
import { APIError } from '../../shared/errors/APIError'
import { logger } from '../../config/logger'
import { MissingTokenError } from '../../shared/errors/AuthorizationError/MissingTokenError'
import { InvalidTokenError } from '../../shared/errors/AuthorizationError/InvalidTokenError'
import { Request, Response } from "express"
import config from "../../config/config.js"

const router = require('express').Router()
const { NODE_ENV } = process.env

/**
 * Login the user
 */
router.post('/', async (req: Request, res: Response) => {
  logger.info('AUTHENTICATION_REQUEST', { email: req.body.email })
  try {
    const { token, refreshToken } = await auth.authenticate(req.body)
    logger.info('AUTHENTICATION_SUCCEDED', { email: req.body.email })
    res
      .cookie(config.refreshToken.name, refreshToken, {
        httpOnly: true,
        maxAge: config.refreshToken.expiresInSec * 1000,
        secure: NODE_ENV === 'production'
      })
      .status(200)
      .send({ token })
  } catch (e: any) {
    if (e instanceof APIError) {
      const { type, message } = e
      logger.info('AUTHENTICATION_FAILED', { email: req.body.email, type })
      res.status(400).send({ type, message: req.t(message) })
    } else {
      logger.error('AUTHENTICATION_FAILED', e)
      res.status(500).send()
    }
  }
})

/**
 * Logout the user
 */
router.delete('/', async (req: Request, res: Response) => {
  logger.info('LOGOUT_REQUEST')
  try {
    await auth.logout(req.cookies)
    logger.info('LOGOUT_SUCCEEDED')
    res
      .clearCookie(config.refreshToken.name, {
        httpOnly: true,
        secure: NODE_ENV === 'production'
      })
      .sendStatus(204)
  } catch (e: any) {
    logger.error('LOGOUT_FAILED', e)
    res.status(500).send()
  }
})

/**
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  logger.info('AUTH_REFRESH_REQUEST')
  try {
    const data = await auth.refresh(req.cookies)
    logger.info('AUTH_REFRESH_SUCCEEDED')
    res.status(200).send(data)
  } catch (e: any) {
    if (e instanceof MissingTokenError) {
      logger.info('AUTH_REFRESH_FAILED')
      res.status(401).send({ message: req.t(e.message) })
    } else if (e instanceof InvalidTokenError) {
      logger.info('AUTH_REFRESH_FAILED')
      res.status(403).send({ message: req.t(e.message) })
    } else {
      logger.error('AUTH_REFRESH_FAILED', e)
      res.status(500).send()
    }
  }
})

/**
 * Forgot password
 */
router.post('/forgotPassword', async (req: Request, res: Response) => {
  logger.info('FORGOT_PASSWORD_REQUEST', { body: req.body })
  try {
    const message = await auth.forgotPassword(req.body, req.t)
    logger.info('FORGOT_PASSWORD_SUCCEDED', { email: req.body.email })
    res.status(200).send(message)
  } catch (e: any) {
    logger.error('FORGOT_PASSWORD_FAILED', { body: req.body, err: e })
    if (e instanceof APIError) {
      const { type, message } = e
      res.status(400).send({ type, message: req.t(message) })
    } else {
      res.status(500).send()
    }
  }
})

/**
 * Reset password
 */
router.patch('/resetPassword/:token', async (req: Request, res: Response) => {
  logger.info('RESET_PASSWORD_REQUEST', {
    token: req.params.token
  })
  try {
    const { email, token, refreshToken } = await auth.resetPassword(req.body, req.params.token)
    logger.info('RESET_PASSWORD_SUCCEDED', { user: email })
    res
      .cookie(config.refreshToken.name, refreshToken, {
        httpOnly: true,
        maxAge: config.refreshToken.expiresInSec * 1000,
        secure: NODE_ENV === 'production'
      })
      .status(200)
      .send({ email, token })
  } catch (e: any) {
    logger.error('RESET_PASSWORD_FAILED', { err: e })
    if (e instanceof APIError) {
      const { type, message } = e
      res.status(400).send({ type, message: req.t(message) })
    } else {
      res.status(500).send()
    }
  }
})

export default router
