const error = require("../../middleware/error");

/**
 * Your routes loading goes here
 */
const auth = require("./auth");
const users = require("./users");

module.exports = (app) => {
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
