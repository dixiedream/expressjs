const express = require("express");

const app = express();
const logger = require("./config/logger");
require("./api/routes/index")(app);
require("./config/db")();

const port = process.env.PORT || 3000;

// Start server
app.listen(port, () => {
  logger.info("SERVER_STARTED", { port });
});
