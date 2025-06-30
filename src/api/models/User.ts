import bcrypt from 'bcryptjs'
import Joi from 'joi'
import mongoose, { HydratedDocument } from 'mongoose'
import ROLES from '../../config/roles.js'
import config from "../../config/config.js"

const passwordStrongness = config.passwordStrongness

const { Schema } = mongoose

export interface IUser {
  createdAt: Date
  email: string
  password: string
  role: number
  resetPasswordToken?: string
  resetPasswordTokenExpiration?: Date
}

export const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: Number,
      enum: Object.values(ROLES),
      default: ROLES.USER
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiration: Date
  },
  {
    timestamps: true
  }
)

/**
 * Hooks
 */
UserSchema.pre('save', async function hashPassword(next) {
  const user = this
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    const hashedPsw = await bcrypt.hash(user.password, salt)
    user.password = hashedPsw
  }
  next()
})

/**
 * Exports
 */
export type UserDocument = HydratedDocument<IUser>
export const UserModel = mongoose.model('User', UserSchema)
export const validate = (user: unknown) => {
  const joiModel = Joi.object<{ email: string, password: string, role: number }>({
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email()
      .error(new Error('email.invalid')),
    password: Joi.string()
      .regex(passwordStrongness)
      .required()
      .error(new Error('password.invalid')),
    role: Joi.number().error(new Error('role.invalid'))
  })

  return joiModel.validate(user)
}
