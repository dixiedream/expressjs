import { logger } from '../config/logger.js'
import { InvalidDataError } from '../shared/errors/InvalidDataError.js'
import { UserNotAuthorizedError } from '../shared/errors/UserError/UserNotAuthorizedError.js'
import ROLES from '../config/roles.js'
import { Request, Response, NextFunction } from 'express'
import { AppResponseLocals } from '../../app.js'

export default (_req: Request, res: Response<any, AppResponseLocals>, next: NextFunction): void => {
  try {
    const { user } = res.locals
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
