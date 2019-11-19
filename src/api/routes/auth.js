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
    .then(token => {
      logger.info("AUTHENTICATION_SUCCEDED", { email: req.body.email });
      res.send({ token });
    })
    .catch(error => {
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

module.exports = router;
