/**
 * Created by Alessandro Lucarini
 * Date: 29/10/2019
 * Time: 15:35
 */
const APIError = require("../APIError");

module.exports = class InvalidTokenError extends (
  APIError
) {
  constructor(message) {
    super(message || "Invalid token");
  }
};
