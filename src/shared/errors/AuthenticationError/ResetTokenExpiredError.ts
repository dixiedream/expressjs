import { APIError } from '../APIError'

export class ResetTokenExpiredError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.resetTokenExpired')
  }
}
