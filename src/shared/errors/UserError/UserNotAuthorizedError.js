const APIError = require('../APIError')

module.exports = class UserNotAuthorizedError extends APIError {
  constructor (message) {
    super(message || 'error.userNotAuthorized')
  }
}
