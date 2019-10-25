const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;
const mongoConnection = process.env.MONGO_CONNECTION;

// Setup swagger route for displaying docs
const swaggerUI = require("swagger-ui-express");
const swaggerConfig = require("./config/swagger.json");

/**
 * Your routes loading goes here
 * ex. const users = require('./api/routes/users');
 */

// Db connection
mongoose
  .connect(mongoConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to db");
  })
  .catch(err => {
    console.log(err);
  });

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

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
