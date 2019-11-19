const express = require("express");
const router = require("express").Router();
const logger = require("../../config/logger");
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

  /**
   * Healthcheck route
   */
  router.get("/healthz", (req, res) => {
    logger.info(`In handler ${req.path}`);
    res.status(200).send("I'm happy and healthy\n");
  });

  /**
   * Setup Express router
   */
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use(error);
};
