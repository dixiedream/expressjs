import argon2 from 'argon2'
import bcrypt from 'bcryptjs'

export type PasswordEncryption = 'bcrypt' | 'argon2id'
export const LEGACY_ENCRYPTION_TYPES: PasswordEncryption[] = ['bcrypt']
export const PASSWORD_ENCRYPTION_DEFAULT: PasswordEncryption = 'argon2id'

export default {
  async hash (clear: string, passwordEncryption: PasswordEncryption = 'argon2id') {
    switch (passwordEncryption) {
      case 'bcrypt':
        // eslint-disable-next-line
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(clear, salt)
      case 'argon2id':
        return await argon2.hash(clear, {
          memoryCost: 19,
          parallelism: 1,
          timeCost: 2,
        })
    }
  },
  async verify (clear: string, hashed: string, passwordEncryption: PasswordEncryption) {
    switch (passwordEncryption) {
      case 'bcrypt':
        return await bcrypt.compare(clear, hashed)
      case 'argon2id':
        return await argon2.verify(hashed, clear)
    }
  }
}
