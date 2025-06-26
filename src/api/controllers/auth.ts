import Joi from 'joi'
import bcrypt from 'bcryptjs'
import { sendMail } from '../../shared/sendMail'
import { User } from '../models/User'
import { AuthenticationFailedError } from '../../shared/errors/AuthenticationError/AuthenticationFailedError'
import { InvalidDataError } from '../../shared/errors/InvalidDataError'
import { ResetTokenExpiredError } from '../../shared/errors/AuthenticationError/ResetTokenExpiredError'
import { Session } from '../models/Session.js'
import { MissingTokenError } from '../../shared/errors/AuthorizationError/MissingTokenError'
import { verify as jwtVerify } from '../../shared/jwt'
import { InvalidTokenError } from '../../shared/errors/AuthorizationError/InvalidTokenError'
import config from '../../config/config'
import typia, { tags } from "typia"

const passwordStrongness = config.passwordStrongness

const { JWT_REFRESH_PRIVATE_KEY, RESET_PASSWORD_URL } = process.env

type Email = string & tags.Format<"email">
type Password = string & tags.Pattern<"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$">

interface LoginDataInput {
  email: Email
  password: Password
}

/**
 * Validates login data, it's different from the user validate functions
 * because you may want to pass different data
 */
const validate = typia.createIs<LoginDataInput>()
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

const validateForgotPassword = typia.createAssert<{ email: Email }>()
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
const validateResetPassword = typia.createAssert<ResetPasswordRequest>()
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
  authenticate: async (body: unknown) => {
    if (!validate(body)) {
      throw new InvalidDataError()
    }
    // validate(body)
    // const { error } = validate(body)
    // if (error) {
    //   throw new InvalidDataError(error.message)
    // }

    const user = await User.findOne({ email: body.email })
    if (!user) throw new AuthenticationFailedError()

    const validPassword = await bcrypt.compare(body.password, user.password)
    if (!validPassword) {
      throw new AuthenticationFailedError()
    }

    const token = user.generateAuthToken()
    const rToken = user.generateRefreshToken()
    await Session.deleteMany({ user: user._id })
    await Session.create({ refreshToken: rToken, user: user._id })

    return { token, refreshToken: rToken }
  },
  forgotPassword: async (body, t) => {
    const { error } = validateForgotPassword(body)
    if (error) {
      throw new InvalidDataError(error.message)
    }

    const user = await User.findOne({ email: body.email })
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
  logout: async (cookies) => {
    const token = cookies.refresh_token
    if (!token) return {}

    return Session.deleteOne({ refreshToken: token })
  },
  refresh: async (cookies) => {
    const token = cookies.refresh_token
    if (!token) {
      throw new MissingTokenError()
    }
    const { data, valid } = jwtVerify(token, JWT_REFRESH_PRIVATE_KEY)
    if (!valid) {
      throw new InvalidTokenError()
    }

    const session = await Session.findOne({ refreshToken: token })
    if (!session) {
      throw new InvalidTokenError()
    }

    let { user } = data
    user = await User.findOne({
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
  resetPassword: async (body: unknown, token) => {
    const { error } = validateResetPassword(body)
    if (error) {
      throw new InvalidDataError(error.message)
    }

    if (!token) {
      throw new InvalidDataError('resetPassword.missingTokenError')
    }

    const user = await User.findOneByResetToken(token)
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
