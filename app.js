const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const profiler = require("./src/middleware/profiler");

const app = express();

if (process.env.NODE_ENV === "production") {
  // eslint-disable-next-line global-require
  require("./src/config/prod")(app);
}

//  Middlewares
app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(profiler);
app.use(express.json({ limit: "1mb" })); // Change limit body size

/**
 * Healthcheck route
 */
app.get("/healthz", (req, res) => {
  res.status(200).send("I'm happy and healthy\n");
});

require("./src/api/routes/index")(app);
require("./src/config/db")();

module.exports = app;
