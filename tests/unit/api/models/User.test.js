const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User } = require("../../../../src/api/models/User");

const { JWT_PRIVATE_KEY, JWT_ISSUER } = process.env;

describe("User.generateAuthToken", () => {
  it("should return a valid JWT", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "abc@abc.com"
    };
    const user = new User(payload);
    const token = user.generateAuthToken();
    const decoded = jwt.verify(token, JWT_PRIVATE_KEY, {
      issuer: [JWT_ISSUER],
      algorithms: ["HS256"]
    });

    expect(decoded).toMatchObject(payload);
  });
});
