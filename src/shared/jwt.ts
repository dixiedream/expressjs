import jwt from 'jsonwebtoken'
const { JWT_ISSUER } = process.env
const TokenExpiredError = 'TokenExpiredError'

export function sign (payload: Record<string, any>, secret: string, expiration: number) {
  return jwt.sign(payload, secret, {
    expiresIn: expiration,
    issuer: JWT_ISSUER ?? 'localhost'
  })
}

export function verify (token: string, secret: string) {
  try {
    const data = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: [JWT_ISSUER ?? 'localhost']
    })

    return {
      data: typeof data === 'string' ? JSON.parse(data) : data,
      expired: false,
      valid: true
    }
  } catch (e: any) {
    return {
      valid: false,
      expired: e.name !== undefined && e.name === TokenExpiredError,
      data: undefined
    }
  }
}
