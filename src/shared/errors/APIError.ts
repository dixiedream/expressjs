/**
 * The base module for handling errors, every other error has to extends this
 */
export class APIError extends Error {
  readonly type: string

  constructor (public message: string, cause?: any) {
    super(message, { cause })
    this.type = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
