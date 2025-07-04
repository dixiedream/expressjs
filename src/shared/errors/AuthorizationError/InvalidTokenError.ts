import { APIError } from '../APIError.js'

export class InvalidTokenError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.invalidToken')
  }
}
