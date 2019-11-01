const mongoose = require("mongoose");
const { type, message } = require("../shared/errors/NotFoundError")(
  "Invalid ID."
);

module.exports = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).send({ type, message });
  }

  return next();
};
