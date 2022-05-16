const APIError = require("../APIError");

module.exports = class AuthenticationFailedError extends APIError {
  constructor(message) {
    super(message || "Invalid email or password");
  }
};
