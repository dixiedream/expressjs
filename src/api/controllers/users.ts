import Joi from 'joi'
import bcrypt from 'bcryptjs'
import { User, validate } from '../models/User'
import { Session } from '../models/Session'
import {UserExistsError } from '../../shared/errors/UserError/UserExistsError'
import {InvalidDataError } from '../../shared/errors/InvalidDataError'
import {NotFoundError } from '../../shared/errors/NotFoundError'
import ROLES from '../../config/roles'
import config from '../../config/config'

async function patchPassword (user, oldPassword: string, newPassword: string) {
  const joiModel = Joi.object({
    oldPassword: Joi.string()
      .regex(config.passwordStrongness)
      .required()
      .error(new Error('password.invalid')),
    newPassword: Joi.string()
      .regex(config.passwordStrongness)
      .required()
      .error(new Error('password.invalid'))
  })

  const { error } = joiModel.validate({ oldPassword, newPassword })
  if (error) {
    throw new InvalidDataError(error.message)
  }

  const validPassword = await bcrypt.compare(oldPassword, user.password)
  if (!validPassword) {
    throw new InvalidDataError('oldPassword.invalid')
  }

  const loggedUser = user
  loggedUser.password = newPassword
  await loggedUser.save()

  return loggedUser
}

export default {
  register: async (body: unknown) => {
    const { error } = validate(body)
    if (error) {
      throw new InvalidDataError(error.message)
    }

    let user = await User.findOne({ email: body.email })
    if (user) throw new UserExistsError()

    user = new User({
      email: body.email,
      password: body.password
    })

    await user.save()

    const token = user.generateAuthToken()
    const rToken = user.generateRefreshToken()
    await Session.deleteMany({ user: user._id })
    await Session.create({ refreshToken: rToken, user: user._id })

    return { token, email: user.email, refreshToken: rToken }
  },
  getMe: (user) => {
    return {
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  },
  patchMe: async (user, body) => {
    let updatedUser = user
    if (body.oldPassword && body.newPassword) {
      const { oldPassword, newPassword } = body
      updatedUser = await patchPassword(updatedUser, oldPassword, newPassword)
    }

    return {
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt
    }
  },
  patch: async (userID, body) => {
    const user = await User.findOne({ _id: userID })
    if (!user) {
      throw new NotFoundError()
    }

    if (body.role) {
      if (!Object.values(ROLES).includes(body.role)) {
        throw new InvalidDataError()
      }
      user.role = body.role
    }

    await user.save()
    return {
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  },
  all: async () => {
    const users = await User.find().select('-password -__v')
    return users
  }
}
