/**
 * Created by Alessandro Lucarini
 * Date: 25/10/2019
 * Time: 22:16
 */
const router = require("express").Router();
const auth = require("../controllers/auth");
const APIError = require("../../shared/errors/APIError");
const logger = require("../../config/logger");

/**
 * Login the user
 */
router.post("/", (req, res) => {
  logger.info("AUTHENTICATION_REQUEST", { email: req.body.email });
  auth
    .authenticate(req.body)
    .then((token) => {
      logger.info("AUTHENTICATION_SUCCEDED", { email: req.body.email });
      res.send({ token });
    })
    .catch((error) => {
      if (error instanceof APIError) {
        const { type, message } = error;
        logger.info("AUTHENTICATION_FAILED", { email: req.body.email, type });
        res.status(400).send({ type, message });
      } else {
        logger.error("AUTHENTICATION_FAILED", error);
        res.status(500).send();
      }
    });
});

/**
 * Forgot password
 */
router.post("/forgotPassword", (req, res) => {
  logger.info("FORGOT_PASSWORD_REQUEST", { body: req.body });
  auth
    .forgotPassword(req.body)
    .then((message) => {
      logger.info("FORGOT_PASSWORD_SUCCEDED", { email: req.body.email });
      res.status(200).send(message);
    })
    .catch((err) => {
      logger.error("FORGOT_PASSWORD_FAILED", { body: req.body, err });
      if (err instanceof APIError) {
        const { type, message } = err;
        res.status(400).send({ type, message });
      } else {
        res.status(500).send();
      }
    });
});

/**
 * Reset password
 */
router.patch("/resetPassword/:token", (req, res) => {
  logger.info("RESET_PASSWORD_REQUEST", {
    token: req.params.token,
  });
  auth
    .resetPassword(req.body, req.params.token)
    .then((user) => {
      logger.info("RESET_PASSWORD_SUCCEDED", { user: user.email });
      res.status(200).send(user);
    })
    .catch((err) => {
      logger.error("RESET_PASSWORD_FAILED", { err });
      if (err instanceof APIError) {
        const { type, message } = err;
        res.status(400).send({ type, message });
      } else {
        res.status(500).send();
      }
    });
});

module.exports = router;
