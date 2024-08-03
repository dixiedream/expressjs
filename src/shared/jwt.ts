import jwt from 'jsonwebtoken'
const { JWT_ISSUER } = process.env
const TokenExpiredError = 'TokenExpiredError'

export default {
  sign: (payload: Record<string, any>, secret: string, expiration: string) => {
    return jwt.sign(payload, secret, {
      expiresIn: expiration
    })
  },
  verify: (token: string, secret: string) => {
    try {
      const data = jwt.verify(token, secret, {
        algorithms: ['HS256'],
        issuer: [JWT_ISSUER ?? 'localhost']
      })

      return {
        data,
        expired: false,
        valid: true
      }
    } catch (e: any) {
      return {
        valid: false,
        expired: e.name !== undefined && e.name === TokenExpiredError,
        data: null
      }
    }
  }
}
