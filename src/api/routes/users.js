const router = require("express").Router();
const auth = require("../../middleware/auth");
const users = require("../controllers/users");
const APIError = require("../../shared/errors/APIError");
const logger = require("../../config/logger");

const {
  refreshToken: { name: rTokenName, expiresIn: rTokenExpiration },
} = require("../../config/config");

/**
 * Get user data
 */
router.get("/me", auth, (req, res) => {
  logger.info("ME_REQUEST", { user: req.user.email });
  const user = users.getMe(req.user);
  logger.info("ME_REQUEST_SUCCEEDED", { user: user.email });
  res.status(200).send(user);
});

/**
 * Register a new user
 */
router.post("/", (req, res) => {
  logger.info(`CREATE_USER_REQUEST`, { email: req.body.email });
  users
    .register(req.body)
    .then(({ token, email, refreshToken }) => {
      logger.info("CREATE_USER_SUCCEDED", { email });
      res
        .cookie(rTokenName, refreshToken, {
          httpOnly: true,
          maxAge: rTokenExpiration * 1000,
          secure: process.env.NODE_ENV === "production",
        })
        .status(201)
        .send({ email, token });
    })
    .catch((error) => {
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
