/**
 * The base module for handling errors, every other error has to extends this
 */
module.exports = class APIError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.type = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
};
