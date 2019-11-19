const router = require("express").Router();
const auth = require("../../middleware/auth");
const users = require("../controllers/users");
const APIError = require("../../shared/errors/APIError");
const logger = require("../../config/logger");

router.get("/me", auth, (req, res) => {
  res.status(200).send("User data");
});

router.post("/", (req, res) => {
  logger.info(`CREATE_USER_REQUEST`, { email: req.body.email });
  users
    .register(req.body)
    .then(({ token, email }) => {
      logger.info("CREATE_USER_SUCCEDED", { email });
      res.status(201).send({ email, token });
    })
    .catch(error => {
      if (error instanceof APIError) {
        const { type, message } = error;
        logger.info("CREATE_USER_FAILED", { type, email: req.body.email });
        res.status(400).send({ type, message });
      } else {
        logger.error("CREATE_USER_FAILED", error);
        res.status(500).send();
      }
    });
});

module.exports = router;
