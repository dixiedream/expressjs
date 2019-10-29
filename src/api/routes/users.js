const router = require("express").Router();
const auth = require("../../middleware/auth");
const users = require("../controllers/users");
const APIError = require("../../shared/errors/APIError");
const logger = require("../../config/logger");

router.get("/me", auth, (req, res) => {
  res.status(200).send("User data");
});

router.post("/", (req, res) => {
  logger.info(`CREATE_USER_REQUESTED`, { email: req.body.email });
  users
    .register(req.body)
    .then(({ token, email }) => {
      logger.info("USER_CREATED", { email });
      res
        .header("Authorization", `Bearer ${token}`)
        .status(201)
        .send({ email });
    })
    .catch(error => {
      if (error instanceof APIError) {
        const { type, message } = error;
        logger.error("CREATE_USER_FAILED", { type, email: req.body.email });
        res.status(400).send({ type, message });
      }
    });
});

module.exports = router;
