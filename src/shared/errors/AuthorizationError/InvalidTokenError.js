const APIError = require("../APIError");

module.exports = class InvalidTokenError extends APIError {
  constructor(message) {
    super(message || "error.invalidToken");
  }
};
