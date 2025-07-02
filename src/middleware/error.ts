import { logger } from '../config/logger.js'
import { Request, Response, NextFunction } from 'express'

/**
 * Error-handling middleware always takes four arguments.
 * You must provide four arguments to identify it as an error-handling middleware function.
 * Even if you don’t need to use the next object, you must specify it to maintain the signature.
 * Otherwise, the next object will be interpreted as regular middleware and will fail to handle errors.
 */
// eslint-disable-next-line no-unused-vars
export default (err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message, err)

  res.status(500).send({ message: 'Something failed' })
}
