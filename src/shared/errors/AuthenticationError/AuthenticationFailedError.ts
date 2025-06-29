import { APIError } from '../APIError.js'

export class AuthenticationFailedError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.authenticationFailed')
  }
}
