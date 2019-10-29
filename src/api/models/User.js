/**
 * Created by Alessandro Lucarini
 * Date: 29/10/2019
 * Time: 17:05
 */
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const { JWT_TOKEN } = process.env;
const { Schema } = mongoose;

const User = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

User.pre("save", async function hashPassword(next) {
  const user = this;
  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    const hashedPsw = await bcrypt.hash(user.password, salt);
    user.password = hashedPsw;
  }
  next();
});

User.methods.generateAuthToken = function generateAuthToken() {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email
    },
    JWT_TOKEN
  );
  return token;
};

exports.User = mongoose.model("User", User);
exports.validate = user => {
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

  return joiModel.validate(user);
};
