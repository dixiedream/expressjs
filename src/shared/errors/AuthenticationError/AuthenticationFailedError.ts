import { APIError } from '../APIError'

export class AuthenticationFailedError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.authenticationFailed')
  }
}
