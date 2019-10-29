/**
 * Created by Alessandro Lucarini
 * Date: 25/10/2019
 * Time: 22:16
 */
const router = require("express").Router();
const auth = require("../controllers/auth");
const APIError = require("../../shared/errors/APIError");

router.post("/", (req, res) => {
  auth
    .authenticate(req.body)
    .then(token => res.send({ token }))
    .catch(error => {
      if (error instanceof APIError) {
        const { type, message } = error;
        res.status(400).send({ type, message });
      }
    });
});

module.exports = router;
