import { APIError } from './APIError'

export class InvalidDataError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.invalidData')
  }
}
