const APIError = require('./APIError')

module.exports = class InvalidDataError extends APIError {
  constructor (message) {
    super(message || 'error.invalidData')
  }
}
