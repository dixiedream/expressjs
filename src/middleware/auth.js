const jwt = require("jsonwebtoken");
const { User } = require("../api/models/User");
const APIError = require("../shared/errors/APIError");
const NotAuthorizedError = require("../shared/errors/UserError/UserNotAuthorizedError");
const MissingTokenError = require("../shared/errors/AuthorizationError/MissingTokenError");
const InvalidTokenError = require("../shared/errors/AuthorizationError/InvalidTokenError");
const logger = require("../config/logger");

const { JWT_PRIVATE_KEY, JWT_ISSUER } = process.env;

function verifyJWT(token) {
  return jwt.verify(token, JWT_PRIVATE_KEY, {
    algorithms: ["HS256"],
    issuer: [JWT_ISSUER],
  });
}

const auth = async (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;

  try {
    if (!accessToken) {
      throw new MissingTokenError();
    }

    try {
      const data = verifyJWT(accessToken);

      const user = await User.findOne({ _id: data._id });
      if (!user) {
        throw new NotAuthorizedError();
      }

      req.user = user;
      logger.info("USER_AUTHORIZED", { email: user.email });
      next();
    } catch (error) {
      // Access token is expired
      if (!refreshToken) {
        throw new MissingTokenError();
      }

      const data = verifyJWT(refreshToken);
    }
  } catch (error) {
    const { name, message } = error;
    logger.info("AUTHORIZATION_FAILED", {
      errorName: name,
      errorMessage: message,
    });
    if (
      error instanceof NotAuthorizedError ||
      error instanceof MissingTokenError
    ) {
      res.status(401).send({ type: error.type, message });
    } else if (error instanceof APIError) {
      res.status(401).send({ type: error.type, message });
    } else {
      logger.error("AUTHORIZATION_UNKNOWN_ERROR", error);
      const err = new InvalidTokenError();
      res.status(401).send({ type: err.type, message: err.message });
    }
  }
};

// const auth = async (req, res, next) => {
//   let token = req.header("Authorization");
//   try {
//     if (!token) {
//       throw new MissingTokenError();
//     }

//     token = token.replace("Bearer ", "");
//     const data = jwt.verify(token, JWT_PRIVATE_KEY, {
//       algotithms: ["HS256"],
//       issuer: [JWT_ISSUER],
//     });
//     const user = await User.findOne({ _id: data._id });
//     if (!user) {
//       throw new NotAuthorizedError();
//     }
//     req.user = user;
//     req.token = token;
//     logger.info("USER_AUTHORIZED", { email: user.email });
//     next();
//   } catch (error) {
//     logger.info("AUTHORIZATION_FAILED", {
//       errorName: error.name,
//       errorMessage: error.message,
//     });
//     if (
//       error instanceof NotAuthorizedError ||
//       error instanceof MissingTokenError
//     ) {
//       res.status(401).send({ type: error.type, message: error.message });
//     } else if (error instanceof APIError) {
//       res.status(401).send({ type: error.type, message: error.message });
//     } else {
//       logger.error("AUTHORIZATION_UNKNOWN_ERROR", error);
//       const err = new InvalidTokenError();
//       res.status(401).send({ type: err.type, message: err.message });
//     }
//   }
// };
module.exports = auth;
