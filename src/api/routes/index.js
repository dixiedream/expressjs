const express = require("express");
const swaggerUI = require("swagger-ui-express");
const error = require("../../middleware/error");

/**
 * Your routes loading goes here
 */
const auth = require("./auth");
const users = require("./users");

// Setup swagger route for displaying docs

module.exports = app => {
  //  Middlewares
  app.use(express.json());
  app.use("/docs", swaggerUI.serve, swaggerUI.setup("./config/openapi.json"));

  /**
   * Setup Express router
   */
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use(error);
};
