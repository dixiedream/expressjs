const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
const sendMail = require("../../shared/sendMail");
const { User } = require("../models/User");
const AuthenticationFailedError = require("../../shared/errors/AuthenticationError/AuthenticationFailedError");
const InvalidDataError = require("../../shared/errors/InvalidDataError");
const ResetTokenExpiredError = require("../../shared/errors/AuthenticationError/ResetTokenExpiredError");

/**
 * Validates login data, it's different from the user validate functions
 * because you may want to pass different data
 * @todo To implement password complications
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

function validateForgotPassword(body) {
  const joiModel = Joi.object({
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email()
  });

  return joiModel.validate(body);
}

function validateResetPassword(body) {
  const joiModel = Joi.object({
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
  },
  forgotPassword: async body => {
    const { error } = validateForgotPassword(body);
    if (error) {
      throw new InvalidDataError(error.details[0].message);
    }

    const user = await User.findOne({ email: body.email });
    if (!user) {
      throw new InvalidDataError();
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetURL = `https://yourdomain/reset-password/${resetToken}`;
    const message = `You're receiving this email because you (or someone else) has requested the reset of a password. Please click on this link to proceed: \n\n ${resetURL}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Your reset password link",
        text: message
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpiration = undefined;
      await user.save();
      throw err;
    }

    return { message: "Email sent with reset link" };
  },
  resetPassword: async (body, token) => {
    const { error } = validateResetPassword(body);
    if (error) {
      throw new InvalidDataError(error.details[0].message);
    }

    if (!token) {
      throw new InvalidDataError("Missing data");
    }

    const user = await User.findOneByResetToken(token);
    if (!user) {
      throw new ResetTokenExpiredError();
    }

    user.password = body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiration = undefined;

    await user.save();

    const authToken = user.generateAuthToken();

    return {
      email: user.email,
      token: authToken
    };
  }
};
