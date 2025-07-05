/**
 * The base module for handling errors, every other error has to extends this
 */
export class APIError extends Error {
  readonly type: string
  statusCode: number

  constructor (public message: string, cause?: any) {
    super(message, { cause })
    this.type = this.constructor.name
    this.statusCode = 500
    Error.captureStackTrace(this, this.constructor)
  }
}
