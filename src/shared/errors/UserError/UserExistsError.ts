import { APIError } from '../APIError.js'

export class UserExistsError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.userExists')
    this.statusCode = 400
  }
}
