/**
 * Created by Alessandro Lucarini
 * Date: 29/10/2019
 * Time: 15:34
 */
const APIError = require("../APIError");

module.exports = class MissingTokenError extends APIError {
  constructor(message) {
    super(message || "No token provided");
  }
};
