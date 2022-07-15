const APIError = require("../APIError");

module.exports = class MissingTokenError extends APIError {
  constructor(message) {
    super(message || "error.missingToken");
  }
};
