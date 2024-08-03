import { APIError } from '../APIError'

export class UserNotAuthorizedError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.userNotAuthorized')
  }
}
