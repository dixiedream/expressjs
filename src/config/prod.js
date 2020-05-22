const helmet = require("helmet");
const compression = require("compression");

/**
 * Setup for production environment
 */
module.exports = (app) => {
  app.use(helmet());
  app.use(compression());
};
