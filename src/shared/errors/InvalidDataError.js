/**
 * Created by Alessandro Lucarini
 * Date: 25/10/2019
 * Time: 22:25
 */
const APIError = require("./APIError");

module.exports = class InvalidDataError extends (
  APIError
) {
  constructor(message) {
    super(message || "Invalid data");
  }
};
