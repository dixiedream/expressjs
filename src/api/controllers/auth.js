const Joi = require("joi");
const bcrypt = require("bcryptjs");
const sendMail = require("../../shared/sendMail");
const { User } = require("../models/User");
const AuthenticationFailedError = require("../../shared/errors/AuthenticationError/AuthenticationFailedError");
const InvalidDataError = require("../../shared/errors/InvalidDataError");
const ResetTokenExpiredError = require("../../shared/errors/AuthenticationError/ResetTokenExpiredError");
const { Session } = require("../models/Session");
const MissingTokenError = require("../../shared/errors/AuthorizationError/MissingTokenError");
const { verify: jwtVerify } = require("../../shared/jwt");
const InvalidTokenError = require("../../shared/errors/AuthorizationError/InvalidTokenError");

const { JWT_REFRESH_PRIVATE_KEY } = process.env;

/**
 * Validates login data, it's different from the user validate functions
 * because you may want to pass different data
 * @todo To implement password complications
 */
function validate(body) {
  const joiModel = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return joiModel.validate(body);
}

function validateForgotPassword(body) {
  const joiModel = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
  });

  return joiModel.validate(body);
}

function validateResetPassword(body) {
  const joiModel = Joi.object({
    password: Joi.string().min(5).max(255).required(),
  });

  return joiModel.validate(body);
}

module.exports = {
  authenticate: async (body) => {
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
    const rToken = user.generateRefreshToken();
    await Session.deleteMany({ user: user._id });
    await Session.create({ refreshToken: rToken, user: user._id });

    return { token, refreshToken: rToken };
  },
  forgotPassword: async (body) => {
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
        text: message,
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpiration = undefined;
      await user.save();
      throw err;
    }

    return { message: "Email sent with reset link" };
  },
  logout: async (cookies) => {
    const token = cookies.refresh_token;
    if (!token) return {};

    return Session.deleteOne({ refreshToken: token });
  },
  refresh: async (cookies) => {
    const token = cookies.refresh_token;
    if (!token) {
      throw new MissingTokenError(); // 401
    }
    const { data, valid } = jwtVerify(token, JWT_REFRESH_PRIVATE_KEY);
    if (!valid) {
      throw new InvalidTokenError("non valido"); // 403
    }

    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      throw new InvalidTokenError("sessione non trovata"); // 403
    }

    let { user } = data;
    if (user !== session.user.toString()) {
      throw new InvalidTokenError("Utenti diversi"); // 403
    }

    user = await User.findOne({
      _id: user,
    });

    if (!user) {
      throw new InvalidTokenError();
    }

    const authToken = user.generateAuthToken();
    return {
      token: authToken,
    };
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
    const rToken = user.generateRefreshToken();
    await Session.deleteMany({ user: user._id });
    await Session.create({ refreshToken: rToken });

    return {
      email: user.email,
      token: authToken,
      refreshToken: rToken,
    };
  },
};
