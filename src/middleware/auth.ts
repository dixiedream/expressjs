import { verify } from '../shared/jwt.js'
import { Request, NextFunction } from 'express'
import { MissingTokenError } from '../shared/errors/AuthorizationError/MissingTokenError.js'
import { InvalidTokenError } from '../shared/errors/AuthorizationError/InvalidTokenError.js'
import { logger } from '../config/logger.js'
import { InvalidDataError } from '../shared/errors/InvalidDataError.js'
import config from '../config/config.js'
import { AppResponse } from '../../app.js'
import { UserModel } from '../api/models/User.js'

const TOKEN_NAME = config.accessToken.name

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY ?? 'NOT_DEFINED'

export default async (req: Request, res: AppResponse, next: NextFunction): Promise<void> => {
  try {
    const header = req.header(TOKEN_NAME)
    const token = header !== undefined && header[0].replace('Bearer ', '')
    if (!token) {
      throw new MissingTokenError()
    }

    const { data, expired, valid } = verify(token, JWT_PRIVATE_KEY)
    if (expired || !valid) {
      throw new InvalidTokenError()
    }

    if (data === null) throw new InvalidTokenError()
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data

    const user = await UserModel.findOne({ _id: parsedData.user })
    if (user == null) {
      throw new InvalidDataError()
    }

    res.locals.user = user
    res.locals.token = token
    logger.info('USER_AUTHORIZED', { user: user.email })
    next()
  } catch (error: any) {
    if (error instanceof MissingTokenError) {
      logger.info('AUTHORIZATION_FAILED')
      res.status(401).send({ type: error.type, message: error.message })
    } else {
      logger.info('AUTHORIZATION_FAILED')
      res.status(403).send({ type: error.type, message: error.message })
    }
  }
}
