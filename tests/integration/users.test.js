const request = require("supertest");
const { User } = require("../../src/api/models/User");
const users = require("../../src/api/controllers/users");

let server;

const endpoint = "/api/users";

describe(endpoint, () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    server = require("../../src/app");
  });
  afterEach(async () => {
    server.close();
    await User.deleteMany({});
  });

  describe("POST /", () => {
    let email;
    let password;

    const exec = async () => {
      return request(server)
        .post(endpoint)
        .send({ email, password });
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
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should not register the user if empty body", async () => {
      const res = await request(server).post(endpoint);

      expect(res.status).toBe(400);
    });
  });

  describe("GET /me", () => {
    it("should return user data if logged in", async () => {
      // TODO: has to be registered
      const { token } = users.register({
        email: "johndoe@anonymous.com",
        password: "rememberthefifth"
      });

      const res = await request(server)
        .get(`${endpoint}/me`)
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(res.status).toBe(200);
    });

    it("should return 401 is user is not logged in", async () => {
      const res = await request(server).get(`${endpoint}/me`);

      expect(res.status).toBe(401);
    });
  });
});
