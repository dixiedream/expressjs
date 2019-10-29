const router = require("express").Router();
const auth = require("../../middleware/auth");
const users = require("../controllers/users");
const APIError = require("../../shared/errors/APIError");

router.get("/me", auth, (req, res) => {
  res.status(200).send("User data");
});

router.post("/", (req, res) => {
  users
    .register(req.body)
    .then(({ token, email }) => {
      res
        .header("Authorization", `Bearer ${token}`)
        .status(201)
        .send({ email });
    })
    .catch(error => {
      if (error instanceof APIError) {
        const { type, message } = error;
        res.status(400).send({ type, message });
      }
    });
});

module.exports = router;
