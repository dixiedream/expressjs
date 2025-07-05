import { sign } from './jwt.js'
import config from '../config/config.js'
import crypto from 'node:crypto'
import { logger } from '../config/logger.js'

const aTokenExpiration = config.accessToken.expiresInSec * 1000
const rTokenExpiration = config.refreshToken.expiresInSec * 1000

const { JWT_PRIVATE_KEY, JWT_REFRESH_PRIVATE_KEY } = process.env

export default {
  generateAuthToken: (user: string, expirationMs?: number): string => {
    expirationMs = expirationMs ?? aTokenExpiration
    logger.debug('Generating auth token for...', { user, expirationMs })
    return sign({ user }, JWT_PRIVATE_KEY ?? 'NOT_DEFINED', expirationMs)
  },
  generateRefreshToken: (user: string, expirationMs?: number): string => {
    expirationMs = expirationMs ?? rTokenExpiration
    logger.debug('Generating refresh token for...', { user, expiration: expirationMs })
    return sign({ user }, JWT_REFRESH_PRIVATE_KEY ?? 'NOT_DEFINED', expirationMs)
  },
  generateResetPasswordToken: (data: string): string => {
    logger.debug('Generating reset password token...', { data })
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
  }
}
