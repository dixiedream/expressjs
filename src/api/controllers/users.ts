import { UserDocument, UserModel } from '../models/User.js'
import { Session } from '../models/Session.js'
import { UserExistsError } from '../../shared/errors/UserError/UserExistsError.js'
import { InvalidDataError } from '../../shared/errors/InvalidDataError.js'
import { NotFoundError } from '../../shared/errors/NotFoundError.js'
import ROLES from '../../config/roles.js'
import typia from 'typia'
import { Password } from '../../types/Core.js'
import mongoose from 'mongoose'
import { LoginDataInput } from '../../types/Requests.js'
import { validateLoginData } from '../../shared/validators.js'
import token from '../../shared/tokenUtils.js'
import passwordUtils from '../../shared/passwordUtils.js'

interface PatchPasswordInput {
  oldPassword: Password
  newPassword: Password
}

async function patchPassword (user: UserDocument, oldPassword: string, newPassword: string): Promise<UserDocument> {
  typia.assertGuard<PatchPasswordInput>({ oldPassword, newPassword })

  const validPassword = await passwordUtils.verify(oldPassword, user.password, user.passwordEncryption)
  if (!validPassword) {
    throw new InvalidDataError('oldPassword.invalid')
  }

  const loggedUser = user
  loggedUser.password = newPassword
  await loggedUser.save()

  return loggedUser
}

export default {
  register: async (body: LoginDataInput): Promise<{ token: string, email: string, refreshToken: string }> => {
    try {
      validateLoginData(body)
    } catch (e: any) {
      throw new InvalidDataError(e)
    }

    let user = await UserModel.findOne({ email: body.email })
    if (user != null) throw new UserExistsError()

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
  getMe: (user: UserDocument): { email: string, role: number, createdAt: Date } => {
    return {
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  },
  patchMe: async (user: UserDocument, body: PatchPasswordInput): Promise<{ email: string, role: number, createdAt: Date }> => {
    let updatedUser = user
    if (body.oldPassword !== undefined && body.newPassword !== undefined) {
      const { oldPassword, newPassword } = body
      updatedUser = await patchPassword(updatedUser, oldPassword, newPassword)
    }

    return {
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt
    }
  },
  patch: async (userID: mongoose.Types.ObjectId, body: { role?: number }): Promise<{ email: string, role: number, createdAt: Date }> => {
    const user = await UserModel.findOne({ _id: userID })
    if (user == null) {
      throw new NotFoundError()
    }

    if (body.role !== undefined) {
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
  all: async (): Promise<UserDocument[]> => {
    const users = await UserModel.find().select('-password -__v')
    return users
  }
}
