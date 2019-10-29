const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const { User } = require("../models/User");
const AuthenticationFailedError = require("../../shared/errors/AuthenticationError/AuthenticationFailedError");
const InvalidDataError = require("../../shared/errors/InvalidDataError");

/**
 * Validates login data
 */
function validate(body) {
  const joiModel = Joi.object({
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  });

  return joiModel.validate(body);
}

module.exports = {
  authenticate: async body => {
    const { error } = validate(body);
    if (error) {
      throw new InvalidDataError(error.details[0].message);
    }

    const user = await User.findOne({ email: body.email });
    if (!user) throw new AuthenticationFailedError();

    const validPassword = await bcrypt.compare(body.password, user.password);
    if (!validPassword) {
      throw new AuthenticationFailedError();
    }

    const token = user.generateAuthToken();

    return token;
  }
};
