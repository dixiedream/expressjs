import { logger } from '../config/logger'
import { InvalidDataError } from '../shared/errors/InvalidDataError'
import { UserNotAuthorizedError } from '../shared/errors/UserError/UserNotAuthorizedError'
import ROLES from '../config/roles'
import { Request, Response, NextFunction } from 'express'

export default (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { user } = req as any
    if (user === undefined) {
      throw new InvalidDataError()
    }

    if (user.role !== ROLES.ADMIN) {
      throw new UserNotAuthorizedError()
    }

    next()
  } catch (error: any) {
    logger.info('AUTHORIZATION_FAILED')
    res.status(403).send({ type: error.type, message: error.message })
  }
}
