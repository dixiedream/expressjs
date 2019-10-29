const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
const swaggerUI = require("swagger-ui-express");
require("express-async-errors");
const error = require("./middleware/error");

// Setup swagger route for displaying docs
const swaggerConfig = require("./config/openapi.json");

/**
 * Your routes loading goes here
 */
const auth = require("./api/routes/auth");
const users = require("./api/routes/users");

// Db setup
require("./config/logger");
require("./config/db");

//  Middlewares
app.use(express.json());
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerConfig));

app.get("/", (req, res) => {
  console.log(req.name);
  res.send("Index");
});

/**
 * Setup Express router
 */
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use(error);

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
