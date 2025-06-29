import { APIError } from './APIError.js'

export class InvalidDataError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.invalidData')
  }
}
