const APIError = require("../APIError");

module.exports = class UserExistsError extends APIError {
  constructor(message) {
    super(message || "User exists");
  }
};
