import { APIError } from './APIError.js'

export class NotFoundError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.notFound')
    this.statusCode = 404
  }
}
