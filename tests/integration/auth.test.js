const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../src/api/models/User");
const server = require("../../app");

const endpoint = "/api/auth";

describe(endpoint, () => {
  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe("POST /", () => {
    let email;
    let password;

    const exec = async () => {
      return request(server)
        .post("/api/auth")
        .send({ email, password });
    };

    it("should return the access token if valid", async () => {
      email = "johndoe@anonymous.com";
      password = "rememberthefifth";
      const user = await new User({ email, password }).save();
      const token = user.generateAuthToken();

      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token", token);
    });

    it("should return 400 if password is not valid", async () => {
      email = "johndoe@anonymous.com";

      await new User({ email, password: "vforrevenge" }).save();

      password = "rememberthefifth";

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if user not exist", async () => {
      email = "johndoe@anonymous.com";
      password = "rememberthefifth";

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if invalid data", async () => {
      email = "abc.com";
      password = undefined;

      const res = await exec();
      expect(res.status).toBe(400);
    });
  });
});
