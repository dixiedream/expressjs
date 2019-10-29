/**
 * Created by Alessandro Lucarini
 * Date: 26/10/2019
 * Time: 01:23
 */
const APIError = require("../APIError");

module.exports = class AuthenticationFailedError extends APIError {
  constructor(message) {
    super(message || "Invalid email or password");
  }
};
