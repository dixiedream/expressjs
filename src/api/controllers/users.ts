import bcrypt from 'bcryptjs'
import { UserDocument, UserModel } from '../models/User'
import { Session } from '../models/Session'
import { UserExistsError } from '../../shared/errors/UserError/UserExistsError'
import { InvalidDataError } from '../../shared/errors/InvalidDataError'
import { NotFoundError } from '../../shared/errors/NotFoundError'
import ROLES from '../../config/roles'
import typia from 'typia'
import { Password } from '../../types/Core'
import mongoose from 'mongoose'
import { LoginDataInput } from '../../types/Requests'
import { validateLoginData } from '../../shared/validators'
import token from '../../shared/token'

interface PatchPasswordInput {
  oldPassword: Password
  newPassword: Password
}

async function patchPassword(user: UserDocument, oldPassword: string, newPassword: string) {

  typia.assertGuard<PatchPasswordInput>({ oldPassword, newPassword })

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
  register: async (body: LoginDataInput) => {
    validateLoginData(body)

    let user = await UserModel.findOne({ email: body.email })
    if (user) throw new UserExistsError()

    user = new UserModel({
      email: body.email,
      password: body.password
    })

    await user.save()

    const accessToken = token.generateAuthToken(user._id.toString())
    const rToken = token.generateRefreshToken(user._id.toString())
    await Session.deleteMany({ user: user._id })
    await Session.create({ refreshToken: rToken, user: user._id })

    return { token: accessToken, email: user.email, refreshToken: rToken }
  },
  getMe: (user: UserDocument) => {
    return {
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  },
  patchMe: async (user: UserDocument, body: PatchPasswordInput) => {
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
  patch: async (userID: mongoose.Types.ObjectId, body: { role?: number }) => {
    const user = await UserModel.findOne({ _id: userID })
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
    const users = await UserModel.find().select('-password -__v')
    return users
  }
}
