const APIError = require('../APIError')

module.exports = class ResetTokenExpiredError extends APIError {
  constructor (message) {
    super(message || 'error.resetTokenExpired')
  }
}
