/**
 * Created by Alessandro Lucarini
 * Date: 01/11/2019
 * Time: 00:26
 */
const APIError = require("./APIError");

module.exports = class NotFoundError extends APIError {
  constructor(message) {
    super(message || "Not found.");
  }
};
