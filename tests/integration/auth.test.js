const request = require("supertest");
const { User } = require("../../src/api/models/User");

let server;

describe("/api/auth", () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    server = require("../../app");
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

      const res = await exec();
      expect(res.status).toBe(400);
    });
  });
});
