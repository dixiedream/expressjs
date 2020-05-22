const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User } = require("../../../../src/api/models/User");

const { JWT_PRIVATE_KEY, JWT_ISSUER } = process.env;

const payload = {
  _id: new mongoose.Types.ObjectId().toHexString(),
  email: "abc@abc.com",
};

describe("User.getResetPasswordToken", () => {
  it("should set the user token and its expiration", () => {
    const user = new User(payload);

    user.getResetPasswordToken();
    expect(user.resetPasswordToken).not.toBe(undefined);
    expect(user.resetPasswordTokenExpiration).not.toBe(undefined);
  });
});

describe("User.generateAuthToken", () => {
  it("should return a valid JWT", () => {
    const user = new User(payload);
    const token = user.generateAuthToken();
    const decoded = jwt.verify(token, JWT_PRIVATE_KEY, {
      issuer: [JWT_ISSUER],
      algorithms: ["HS256"],
    });

    expect(decoded).toMatchObject(payload);
  });
});
