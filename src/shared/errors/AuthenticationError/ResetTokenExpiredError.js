/**
 * Created by Alessandro Lucarini
 * Date: 18/11/2019
 * Time: 11:40
 */
const APIError = require("../APIError");

module.exports = class ResetTokenExpiredError extends (
  APIError
) {
  constructor(message) {
    super(message || "Reset token is expired");
  }
};
