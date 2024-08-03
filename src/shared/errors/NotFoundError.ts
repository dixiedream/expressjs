import { APIError } from './APIError'

export class NotFoundError extends APIError {
  constructor (message?: string) {
    super(message ?? 'error.notFound')
  }
}
