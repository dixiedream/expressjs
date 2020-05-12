const express = require("express");

const app = express();

if (process.env.NODE_ENV === "production") {
  // eslint-disable-next-line global-require
  require("./src/config/prod")(app);
}

require("./src/api/routes/index")(app);
require("./src/config/db")();

module.exports = app;
