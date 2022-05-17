const { User, validate } = require("../models/User");
const { Session } = require("../models/Session");
const UserExistsError = require("../../shared/errors/UserError/UserExistsError");
const InvalidDataError = require("../../shared/errors/InvalidDataError");

module.exports = {
  register: async (body) => {
    const { error } = validate(body);
    if (error) {
      throw new InvalidDataError(error.details[0].message);
    }

    let user = await User.findOne({ email: body.email });
    if (user) throw new UserExistsError();

    user = new User({
      email: body.email,
      password: body.password,
    });

    await user.save();

    const token = user.generateAuthToken();
    const rToken = user.generateRefreshToken();
    await Session.create({ refreshToken: rToken });

    return { token, email: user.email, refreshToken: rToken };
  },
  getMe: (user) => {
    return {
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  },
};
