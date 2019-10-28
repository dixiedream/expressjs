const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Setup swagger route for displaying docs
const swaggerUI = require("swagger-ui-express");
const swaggerConfig = require("./config/swagger.json");

/**
 * Your routes loading goes here
 * ex. const users = require('./api/routes/users');
 */
const auth = require("./api/routes/auth");
const users = require("./api/routes/users");

// Db setup
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
 * ex. app.use("yourAPIEndPoint", routeFile)
 */
app.use("/api/auth", auth);
app.use("/api/users", users);

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
