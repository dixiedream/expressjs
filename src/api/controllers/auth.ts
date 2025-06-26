import bcrypt from 'bcryptjs'
import { sendMail } from '../../shared/sendMail'
import { AuthenticationFailedError } from '../../shared/errors/AuthenticationError/AuthenticationFailedError'
import { InvalidDataError } from '../../shared/errors/InvalidDataError'
import { ResetTokenExpiredError } from '../../shared/errors/AuthenticationError/ResetTokenExpiredError'
import { Session } from '../models/Session.js'
import { MissingTokenError } from '../../shared/errors/AuthorizationError/MissingTokenError'
import { verify as jwtVerify } from '../../shared/jwt'
import { InvalidTokenError } from '../../shared/errors/AuthorizationError/InvalidTokenError'
import typia from "typia"
import i18next from 'i18next'
import { Email } from '../../types/Core'
import { LoginDataInput } from '../../types/Requests'
import { validateLoginData } from '../../shared/validators'
import { IUser, UserModel } from '../models/User'
import { HydratedDocument } from 'mongoose'

const { JWT_REFRESH_PRIVATE_KEY, RESET_PASSWORD_URL } = process.env

/**
 * Validates login data, it's different from the user validate functions
 * because you may want to pass different data
 */
// function validate(body: unknown) {
//   const joiModel = Joi.object<{ email: string, password: string }>({
//     email: Joi.string()
//       .min(5)
//       .max(255)
//       .required()
//       .email()
//       .error(new Error('email.invalid')),
//     password: Joi.string()
//       .regex(passwordStrongness)
//       .error(new Error('password.invalid'))
//   })
//
//   return joiModel.validate(body)
// }

const validateForgotPassword = typia.createAssertGuard<{ email: Email }>()
// function validateForgotPassword(body: unknown) {
//   const joiModel = Joi.object<{ email: string }>({
//     email: Joi.string()
//       .min(5)
//       .max(255)
//       .required()
//       .email()
//       .error(new Error('email.invalid'))
//   })
//
//   return joiModel.validate(body)
// }

type ResetPasswordRequest = { password: string }
const validateResetPassword = typia.createAssertGuard<ResetPasswordRequest>()
// function validateResetPassword(body: unknown): Joi.ValidationResult<ResetPasswordRequest> {
//   const joiModel = Joi.object<ResetPasswordRequest>({
//     password: Joi.string()
//       .regex(passwordStrongness)
//       .required()
//       .error(new Error('password.invalid'))
//   })
//
//   return joiModel.validate(body)
// }

export default {
  authenticate: async (body: LoginDataInput) => {
    validateLoginData(body)

    const user = await UserModel.findOne({ email: body.email }).exec()
    if (!user) throw new AuthenticationFailedError()

    const validPassword = await bcrypt.compare(body.password, user.password)
    if (!validPassword) {
      throw new AuthenticationFailedError()
    }

    const token = user.model.generateAuthToken()
    const rToken = user.generateRefreshToken()
    await Session.deleteMany({ user: user._id })
    await Session.create({ refreshToken: rToken, user: user._id })

    return { token, refreshToken: rToken }
  },
  forgotPassword: async (body: { email: string }, t: typeof i18next.t) => {
    validateForgotPassword(body)

    const user = await UserModel.findOne({ email: body.email }).exec()
    if (!user) {
      throw new InvalidDataError()
    }

    const resetToken = user.getResetPasswordToken()
    await user.save()

    const resetURL = `${RESET_PASSWORD_URL}/${resetToken}`
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

    return Session.deleteOne({ refreshToken: token })
  },
  refresh: async (cookies: Record<string, any>) => {
    const token = cookies.refresh_token
    if (!token) {
      throw new MissingTokenError()
    }
    const { data, valid } = jwtVerify(token, JWT_REFRESH_PRIVATE_KEY ?? 'NOT_DEFINED')
    if (!valid) {
      throw new InvalidTokenError()
    }

    const session = await Session.findOne({ refreshToken: token }).lean()
    if (!session) {
      throw new InvalidTokenError()
    }

    let { user } = data
    user = await UserModel.findOne({
      _id: user
    })

    if (!user) {
      throw new InvalidTokenError()
    }

    const authToken = user.generateAuthToken()
    return {
      token: authToken
    }
  },
  resetPassword: async (body: ResetPasswordRequest, token?: string) => {
    validateResetPassword(body)

    if (token === undefined) {
      throw new InvalidDataError('resetPassword.missingTokenError')
    }

    const user = await UserModel.findOneByResetToken(token)
    if (!user) {
      throw new ResetTokenExpiredError()
    }

    user.password = body.password
    user.resetPasswordToken = undefined
    user.resetPasswordTokenExpiration = undefined

    await user.save()

    const authToken = user.generateAuthToken()
    const rToken = user.generateRefreshToken()
    await Session.deleteMany({ user: user._id })
    await Session.create({ refreshToken: rToken, user: user._id })

    return {
      email: user.email,
      token: authToken,
      refreshToken: rToken
    }
  }
}
