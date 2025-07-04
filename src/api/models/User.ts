import mongoose, { HydratedDocument } from 'mongoose'
import ROLES from '../../config/roles.js'
import passwordUtils, { LEGACY_ENCRYPTION_TYPES, PASSWORD_ENCRYPTION_DEFAULT, PasswordEncryption } from '../../shared/passwordUtils.js'

const { Schema } = mongoose

export interface IUser {
  createdAt: Date
  email: string
  password: string
  passwordEncryption: PasswordEncryption
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
    passwordEncryption: {
      type: String,
      enum: ['bcrypt', 'argon2id'],
      default: PASSWORD_ENCRYPTION_DEFAULT
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
UserSchema.pre('save', async function hashPassword (next) {
  const user = this
  if (user.isModified('password')) {
    let passwordEncryption = user.passwordEncryption
    if (LEGACY_ENCRYPTION_TYPES.includes(passwordEncryption)) {
      passwordEncryption = PASSWORD_ENCRYPTION_DEFAULT
      user.passwordEncryption = passwordEncryption
    }
    const hashedPsw = await passwordUtils.hash(user.password, passwordEncryption)
    user.password = hashedPsw
  }
  next()
})

/**
 * Exports
 */
export type UserDocument = HydratedDocument<IUser>
export const UserModel = mongoose.model('User', UserSchema)
