import { APIError } from '../APIError.js'

export class ResetTokenExpiredError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.resetTokenExpired')
  }
}
