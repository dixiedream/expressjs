/**
 * Created by Alessandro Lucarini
 * Date: 25/10/2019
 * Time: 12:07
 */
const APIError = require("../APIError");

module.exports = class UserExistsError extends (
  APIError
) {
  constructor(message) {
    super(message || "User exists");
  }
};
