/**
 * Created by Alessandro Lucarini
 * Date: 25/10/2019
 * Time: 16:53
 */
const APIError = require("../APIError");

module.exports = class UserNotAuthorizedError extends APIError {
  constructor(message) {
    super(message || "User not authorized");
  }
};
