import { APIError } from '../APIError'

export class MissingTokenError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.missingToken')
  }
}
