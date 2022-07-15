const logger = require("../config/logger");
const InvalidDataError = require("../shared/errors/InvalidDataError");
const UserNotAuthorizedError = require("../shared/errors/UserError/UserNotAuthorizedError");
const ROLES = require("../config/roles");

const admin = async (req, res, next) => {
  try {
    const { user } = req;
    if (!user) {
      throw new InvalidDataError();
    }

    if (user.role !== ROLES.ADMIN) {
      throw new UserNotAuthorizedError();
    }

    next();
  } catch (error) {
    logger.info("AUTHORIZATION_FAILED");
    res.status(403).send({ type: error.type, message: error.message });
  }
};
module.exports = admin;
