const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Joi = require("joi");
const mongoose = require("mongoose");
const moment = require("moment");
const { sign: jwtSign } = require("../../shared/jwt");
const ROLES = require("../../config/roles");
const {
  accessToken: { expiresIn: aTokenExpiration },
  refreshToken: { expiresIn: rTokenExpiration },
  passwordStrongness,
} = require("../../config/config");

const { JWT_PRIVATE_KEY, JWT_REFRESH_PRIVATE_KEY } = process.env;
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiration: Date,
  },
  { timestamps: true }
);

/**
 * Hooks
 */
UserSchema.pre("save", async function hashPassword(next) {
  const user = this;
  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    const hashedPsw = await bcrypt.hash(user.password, salt);
    user.password = hashedPsw;
  }
  next();
});

/**
 * Methods
 */
UserSchema.methods.getResetPasswordToken = function getResetPasswordToken() {
  const token = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.resetPasswordTokenExpiration = moment().add({ minutes: 10 }).toDate();

  return token;
};

UserSchema.methods.generateAuthToken = function generateAuthToken(expiration) {
  const exp = expiration || aTokenExpiration;
  return jwtSign({ user: this._id }, JWT_PRIVATE_KEY, exp);
};

UserSchema.methods.generateRefreshToken = function generateRefreshToken(
  expiration
) {
  const exp = expiration || rTokenExpiration;
  return jwtSign({ user: this._id }, JWT_REFRESH_PRIVATE_KEY, exp);
};

/**
 * Static methods
 */
UserSchema.statics.findOneByResetToken = async function findOneByResetToken(
  clearToken
) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(clearToken)
    .digest("hex");

  const user = await this.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordTokenExpiration: { $gt: new Date() },
  });

  return user;
};

/**
 * Exports
 */
exports.User = mongoose.model("User", UserSchema);
exports.validate = (user) => {
  const joiModel = Joi.object({
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email()
      .error(new Error("email.invalid")),
    password: Joi.string()
      .regex(passwordStrongness)
      .required()
      .error(new Error("password.invalid")),
    role: Joi.number().error(new Error("role.invalid")),
  });

  return joiModel.validate(user);
};
