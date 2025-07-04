import { APIError } from '../APIError.js'

export class UserNotAuthorizedError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.userNotAuthorized')
  }
}
