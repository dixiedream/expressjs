import { APIError } from '../APIError'

export class UserExistsError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.userExists')
  }
}
