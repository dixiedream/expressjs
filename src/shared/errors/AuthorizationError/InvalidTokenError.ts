import { APIError } from '../APIError'

export class InvalidTokenError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.invalidToken')
  }
}
