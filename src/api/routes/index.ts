import error from '../../middleware/error.js'
import express from "express"

/**
 * Your routes loading goes here
 */
import auth from './auth.js'
import users from './users.js'

export default (app: express.Application) => {
  /**
   * Healthcheck route
   */
  app.get('/healthz', (req, res) => {
    res.status(200).send(`${req.t('healthCheckRoute')}\n`)
  })

  /**
   * Setup Express router
   */
  app.use('/api/auth', auth)
  app.use('/api/users', users)
  app.use(error)
}
