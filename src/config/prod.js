const helmet = require("helmet");
const compression = require("compression");
const logger = require("../config/logger");

module.exports = app => {
  app.use(helmet());
  app.use(compression());

  function shutdown() {
    app.close(function onServerClosed(err) {
      if (err) {
        logger.error(err);
        process.exitCode = 1;
      }

      process.exit();
    });
  }

  // Quit on ctrl-c when running docker in terminal
  process.on("SIGINT", () => {
    logger.info("Got SIGINT (aka ctrl-c in docker). Graceful shutdown");
    shutdown();
  });

  // Quit properly on docker stop
  process.on("SIGTERM", () => {
    logger.info("Got SIGTERM (docker container stop). Graceful shutdown");
    shutdown();
  });
};
