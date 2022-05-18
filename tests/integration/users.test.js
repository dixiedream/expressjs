const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../src/api/models/User");
const { Session } = require("../../src/api/models/Session");

const server = require("../../app");

const endpoint = "/api/users";

describe(endpoint, () => {
  afterEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  afterAll(async () => {
    const { connections } = mongoose;
    connections.forEach((con) => {
      return con.close();
    });
    return mongoose.disconnect();
  });

  describe("POST /", () => {
    let email;
    let password;

    const exec = async () => {
      return request(server).post(endpoint).send({ email, password });
    };

    it("should save the user if valid", async () => {
      email = "johndoe@anonymous.com";
      password = "rememberthefifth";
      await exec();
      const user = await User.findOne({ email });
      expect(user).not.toBeNull();
    });

    it("should return the user if valid", async () => {
      email = "johndoe@anonymous.com";
      password = "rememberthefifth";
      const res = await exec();
      expect(res.body).toHaveProperty("email", email);
    });

    it("should not register the user if invalid email", async () => {
      email = "johndoe";
      password = undefined;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should not register the user if empty body", async () => {
      email = undefined;
      password = undefined;
      const res = await request(server).post(endpoint);

      expect(res.status).toBe(400);
    });
  });

  describe("GET /me", () => {
    it("should return 200 if logged in", async () => {
      const user = await new User({
        email: "johndoe@anonymous.com",
        password: "rememberthefifth",
      }).save();

      const token = user.generateAuthToken();
      const res = await request(server)
        .get(`${endpoint}/me`)
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(res.status).toBe(200);
    });

    it("should return 403 if token is invalid", async () => {
      const user = await new User({
        email: "johndoe@anonymous.com",
        password: "rememberthefifth",
      }).save();

      const token = user.generateAuthToken("1ms");

      const res = await request(server)
        .get(`${endpoint}/me`)
        .set("Authorization", `Bearer a${token}Z`)
        .send();

      expect(res.status).toBe(403);
    });

    it("should return 403 if token is expired", async () => {
      const user = await new User({
        email: "johndoe@anonymous.com",
        password: "rememberthefifth",
      }).save();

      const token = user.generateAuthToken("1ms");

      const res = await request(server)
        .get(`${endpoint}/me`)
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(res.status).toBe(403);
    });

    it("should return 401 if user is no token is provided", async () => {
      const res = await request(server).get(`${endpoint}/me`);
      expect(res.status).toBe(401);
    });
  });
});
