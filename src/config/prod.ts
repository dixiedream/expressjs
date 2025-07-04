import helmet from 'helmet'
import compression from 'compression'
import express from 'express'

/**
 * Setup for production environment
 */
export default (app: express.Application) => {
  app.use(helmet())
  app.use(compression())
}
