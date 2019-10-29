const jwt = require("jsonwebtoken");
const { User } = require("../api/models/User");
const APIError = require("../shared/errors/APIError");
const NotAuthorizedError = require("../shared/errors/UserError/UserNotAuthorizedError");
const MissingTokenError = require("../shared/errors/AuthorizationError/MissingTokenError");
const InvalidTokenError = require("../shared/errors/AuthorizationError/InvalidTokenError");

const { JWT_TOKEN } = process.env;

const auth = async (req, res, next) => {
  let token = req.header("Authorization");
  try {
    if (!token) {
      throw new MissingTokenError();
    }

    token = token.replace("Bearer ", "");
    const data = jwt.verify(token, JWT_TOKEN);
    const user = await User.findOne({ _id: data._id });
    if (!user) {
      throw new NotAuthorizedError();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (
      error instanceof NotAuthorizedError ||
      error instanceof MissingTokenError
    ) {
      res.status(401).send({ type: error.type, message: error.message });
    } else if (error instanceof APIError) {
      res.status(400).send({ type: error.type, message: error.message });
    } else {
      const err = new InvalidTokenError();
      res.status(400).send({ type: err.type, message: err.message });
    }
  }
};
module.exports = auth;
