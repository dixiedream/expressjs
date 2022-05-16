const APIError = require("./APIError");

module.exports = class NotFoundError extends APIError {
  constructor(message) {
    super(message || "Not found.");
  }
};
