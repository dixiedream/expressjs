const express = require("express");
const error = require("../../middleware/error");
const profiler = require("../../middleware/profiler");

/**
 * Your routes loading goes here
 */
const auth = require("./auth");
const users = require("./users");

// Setup swagger route for displaying docs

module.exports = app => {
  //  Middlewares
  if (process.env.NODE_ENV === "development") {
    app.use(profiler);
  }
  app.use(express.json({ limit: "1mb" })); // Change limit body size

  /**
   * Healthcheck route
   */
  app.get("/healthz", (req, res) => {
    res.status(200).send("I'm happy and healthy\n");
  });

  /**
   * Setup Express router
   */
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use(error);
};
