const jwt = require("jsonwebtoken");

const { JWT_ISSUER } = process.env;
const TokenExpiredError = "TokenExpiredError";

module.exports = {
  sign: (payload, secret, expiration) => {
    return jwt.sign(payload, secret, {
      expiresIn: expiration,
      issuer: JWT_ISSUER,
    });
  },
  verify: (token, secret) => {
    try {
      const data = jwt.verify(token, secret, {
        algorithms: ["HS256"],
        issuer: [JWT_ISSUER],
      });

      return {
        data,
        expired: false,
        valid: true,
      };
    } catch ({ name }) {
      return {
        valid: false,
        expired: name === TokenExpiredError,
        data: null,
      };
    }
  },
};
