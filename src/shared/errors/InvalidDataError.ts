import { APIError } from './APIError.js'

export class InvalidDataError extends APIError {
  constructor (cause?: any) {
    const message = typeof cause === 'string' ? cause : 'error.invalidData'
    super(message, cause)
    this.statusCode = 400
  }
}
