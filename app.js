const express = require("express");
const profiler = require("./src/middleware/profiler");

const app = express();

if (process.env.NODE_ENV === "production") {
  // eslint-disable-next-line global-require
  require("./src/config/prod")(app);
}

//  Middlewares
app.use(profiler);

/**
 * Healthcheck route
 */
app.get("/healthz", (req, res) => {
  res.status(200).send("I'm happy and healthy\n");
});

require("./src/api/routes/index")(app);
// require("./src/config/db")();

module.exports = app;
