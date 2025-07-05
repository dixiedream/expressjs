import { logger } from '../config/logger.js'
import { Request, Response, NextFunction } from 'express'
import { APIError } from '../shared/errors/APIError.js'

/**
 * Error-handling middleware always takes four arguments.
 * You must provide four arguments to identify it as an error-handling middleware function.
 * Even if you don’t need to use the next object, you must specify it to maintain the signature.
 * Otherwise, the next object will be interpreted as regular middleware and will fail to handle errors.
 */
export default (err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err)
  }

  let statusCode = 500
  let errorCode = err.name
  let message = err.message
  if (err instanceof APIError) {
    statusCode = err.statusCode
    errorCode = err.type
    message = req.t(message)
  }

  logger.error(message, `${errorCode}/${statusCode}`, err)

  res.status(statusCode).send({ message })
}
