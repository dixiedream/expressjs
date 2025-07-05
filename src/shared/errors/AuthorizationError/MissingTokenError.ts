import { APIError } from '../APIError.js'

export class MissingTokenError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.missingToken')
    this.statusCode = 401
  }
}
