import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import { NotFoundError } from '../shared/errors/NotFoundError.js'

const { type, message } = new NotFoundError('Invalid ID.')

/**
 * Checks if id in URL is a valid mongoDB objectId
 */
export default (req: Request, res: Response, next: NextFunction) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ type, message })
  }

  return next()
}
