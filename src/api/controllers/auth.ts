import crypto from 'node:crypto'
import { sendMail } from '../../shared/sendMail.js'
import { AuthenticationFailedError } from '../../shared/errors/AuthenticationError/AuthenticationFailedError.js'
import { InvalidDataError } from '../../shared/errors/InvalidDataError.js'
import { ResetTokenExpiredError } from '../../shared/errors/AuthenticationError/ResetTokenExpiredError.js'
import { Session } from '../models/Session.js'
import { MissingTokenError } from '../../shared/errors/AuthorizationError/MissingTokenError.js'
import { verify as jwtVerify } from '../../shared/jwt.js'
import { InvalidTokenError } from '../../shared/errors/AuthorizationError/InvalidTokenError.js'
import typia from 'typia'
import i18next from 'i18next'
import { Email } from '../../types/Core.js'
import { LoginDataInput } from '../../types/Requests.js'
import { validateLoginData } from '../../shared/validators.js'
import { UserModel } from '../models/User.js'
import tokenUtils from '../../shared/tokenUtils.js'
import moment from 'moment'
import passwordUtils from '../../shared/passwordUtils.js'
import { logger } from '../../config/logger.js'

const JWT_REFRESH_PRIVATE_KEY = process.env.JWT_REFRESH_PRIVATE_KEY ?? 'NOT_DEFINED'
const RESET_PASSWORD_URL = process.env.RESET_PASSWORD_URL ?? 'localhost'

const validateForgotPassword = typia.createAssertGuard<{ email: Email }>()

interface ResetPasswordRequest { password: string }
const validateResetPassword = typia.createAssertGuard<ResetPasswordRequest>()

export default {
  authenticate: async (body: LoginDataInput) => {
    try {
      validateLoginData(body)
    } catch (e: any) {
      throw new InvalidDataError(e)
    }

    const user = await UserModel.findOne({ email: body.email }).exec()
    if (user == null) throw new AuthenticationFailedError()

    const validPassword = await passwordUtils.verify(body.password, user.password, user.passwordEncryption)
    if (!validPassword) {
      throw new AuthenticationFailedError()
    }

    const aToken = tokenUtils.generateAuthToken(user._id.toString())
    const rToken = tokenUtils.generateRefreshToken(user._id.toString())
    await Session.deleteMany({ user: user._id })
    await Session.create({ refreshToken: rToken, user: user._id })

    return { token: aToken, refreshToken: rToken }
  },
  forgotPassword: async (body: { email: string }, t: typeof i18next.t) => {
    try {
      validateForgotPassword(body)
    } catch (e: any) {
      logger.debug(e)
      throw new InvalidDataError(e)
    }

    const user = await UserModel.findOne({ email: body.email }).exec()
    if (user == null) {
      throw new InvalidDataError()
    }

    const clear = crypto.randomBytes(20).toString('hex')
    user.resetPasswordToken = tokenUtils.generateResetPasswordToken(clear)
    user.resetPasswordTokenExpiration = moment().add({ minutes: 10 }).toDate()

    await user.save()

    const resetURL = `${RESET_PASSWORD_URL}/${clear}`
    const message = `${t(
      'forgotPassword.mail.message'
    )}<br><a href='${resetURL}'>${resetURL}</a>`

    try {
      await sendMail({
        email: user.email,
        subject: t('forgotPassword.mail.subject'),
        text: message
      })
    } catch (err) {
      user.resetPasswordToken = undefined
      user.resetPasswordTokenExpiration = undefined
      await user.save()
      throw err
    }

    return { message: t('forgotPassword.success') }
  },
  logout: async (cookies: Record<string, any>) => {
    const token = cookies.refresh_token
    if (token === undefined) return {}

    return await Session.deleteOne({ refreshToken: token })
  },
  refresh: async (cookies: Record<string, any>) => {
    const token = cookies.refresh_token
    if (token === undefined) {
      throw new MissingTokenError()
    }
    const { data, valid } = jwtVerify(token, JWT_REFRESH_PRIVATE_KEY)
    if (!valid) {
      throw new InvalidTokenError()
    }

    const session = await Session.findOne({ refreshToken: token }).lean()
    if (session == null) {
      throw new InvalidTokenError()
    }

    const { user: userId } = data
    const user = await UserModel.findOne({
      _id: userId
    })

    if (user == null) {
      throw new InvalidTokenError()
    }

    const authToken = tokenUtils.generateAuthToken(user._id.toString())
    return {
      token: authToken
    }
  },
  resetPassword: async (body: ResetPasswordRequest, clear?: string) => {
    try {
      validateResetPassword(body)
    } catch (e: any) {
      throw new InvalidDataError(e)
    }

    if (clear === undefined) {
      throw new InvalidDataError('resetPassword.missingTokenError')
    }

    const hash = tokenUtils.generateResetPasswordToken(clear)

    const user = await UserModel.findOne({ resetPasswordToken: hash, resetPasswordTokenExpiration: { $gt: new Date() } })
    if (user == null) {
      throw new ResetTokenExpiredError()
    }

    user.password = body.password
    user.resetPasswordToken = undefined
    user.resetPasswordTokenExpiration = undefined

    await user.save()

    const authToken = tokenUtils.generateAuthToken(user._id.toString())
    const rToken = tokenUtils.generateRefreshToken(user._id.toString())
    await Session.deleteMany({ user: user._id })
    await Session.create({ refreshToken: rToken, user: user._id })

    return {
      email: user.email,
      token: authToken,
      refreshToken: rToken
    }
  }
}
