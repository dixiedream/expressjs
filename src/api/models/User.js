const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");
const moment = require("moment");

const { JWT_PRIVATE_KEY, JWT_REFRESH_PRIVATE_KEY, JWT_ISSUER } = process.env;
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
    refreshTokens: {
      type: Array,
      default: [],
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

UserSchema.methods.generateAuthToken = function generateAuthToken() {
  const token = jwt.sign(
    {
      _id: this._id,
    },
    JWT_PRIVATE_KEY,
    {
      expiresIn: "15m",
      issuer: JWT_ISSUER,
    }
  );
  return token;
};

UserSchema.methods.generateRefreshToken = function generateRefreshToken() {
  const token = jwt.sign(
    {
      _id: this._id,
    },
    JWT_REFRESH_PRIVATE_KEY,
    {
      expiresIn: "1y",
      issuer: JWT_ISSUER,
    }
  );
  return token;
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
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return joiModel.validate(user);
};
