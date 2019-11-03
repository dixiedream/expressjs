const express = require("express");

const app = express();
const logger = require("./config/logger");
require("./api/routes/index")(app);
require("./config/db")();

if (process.env.NODE_ENV === "production") {
  // eslint-disable-next-line global-require
  require("./config/prod")(app);
}

const port = process.env.PORT || 3000;

// Start server
const server = app.listen(port, () => {
  logger.info("SERVER_STARTED", { port });
});

module.exports = server;
