import { sign } from "./jwt";
import config from "../config/config.js"
import crypto from 'node:crypto'

const aTokenExpiration = config.accessToken.expiresInSec
const rTokenExpiration = config.refreshToken.expiresInSec

const { JWT_PRIVATE_KEY, JWT_REFRESH_PRIVATE_KEY } = process.env

export default {
  generateAuthToken: (user: string, expiration?: number): string => {
    const exp = expiration ?? aTokenExpiration
    return sign({ user }, JWT_PRIVATE_KEY ?? 'NOT_DEFINED', exp)
  },
  generateRefreshToken: (user: string, expiration?: number): string => {
    const exp = expiration ?? rTokenExpiration
    return sign({ user }, JWT_REFRESH_PRIVATE_KEY ?? 'NOT_DEFINED', exp)
  },
  generateResetPasswordToken: (): string => {
    return crypto.randomBytes(20).toString('hex')
  }
}
