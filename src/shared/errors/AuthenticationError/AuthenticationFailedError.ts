import { APIError } from '../APIError.js'

export class AuthenticationFailedError extends APIError {
  constructor (cause?: any) {
    super('error.authenticationFailed', cause)
  }
}
