import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import Joi from 'joi'
import mongoose, { HydratedDocument } from 'mongoose'
import moment from 'moment'
import ROLES from '../../config/roles'
import config from "../../config/config.js"

const passwordStrongness = config.passwordStrongness

const { Schema } = mongoose

export interface IUser {
  email: string
  password: string
  role: number
  resetPasswordToken: string
  resetPasswordTokenExpiration: Date
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
    timestamps: true,
    methods: {
      getResetPasswordToken: function(): string {
        const token = crypto.randomBytes(20).toString('hex')
        this.resetPasswordToken = crypto
          .createHash('sha256')
          .update(token)
          .digest('hex')

        this.resetPasswordTokenExpiration = moment().add({ minutes: 10 }).toDate()

        return token
      },
      // generateAuthToken: function(expiration?: number): string {
      //   const exp = expiration ?? aTokenExpiration
      //   return jwtSign({ user: this._id }, JWT_PRIVATE_KEY ?? 'NOT_DEFINED', exp)
      // },
      // generateRefreshToken: function(expiration?: number): string {
      //   const exp = expiration ?? rTokenExpiration
      //   return jwtSign({ user: this._id }, JWT_REFRESH_PRIVATE_KEY ?? 'NOT_DEFINED', exp)
      // }
    },
    statics: {
      findOneByResetToken: async function(clearToken: string) {
        const hashedToken = crypto
          .createHash('sha256')
          .update(clearToken)
          .digest('hex')

        const user = await this.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordTokenExpiration: { $gt: new Date() }
        })

        return user
      }
    }
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
