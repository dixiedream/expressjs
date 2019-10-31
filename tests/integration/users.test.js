const request = require("supertest");
const { User } = require("../../src/api/models/User");

let server;

describe("/api/users", () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    server = require("../../src/app");
  });
  afterEach(() => {
    server.close();
  });

  describe("POST /", () => {
    it("should register a new user", async () => {
      const res = await request(server).post("/api/users");
      expect(res.status).toBe(200);
    });
  });
});
