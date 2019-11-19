/**
 * Created by Alessandro Lucarini
 * Date: 17/11/2019
 * Time: 19:10
 */
const request = require("supertest");
const server = require("../../app");

const endpoint = "/healthz";

describe(endpoint, () => {
  describe("GET /", () => {
    it("should return 200 if service up and running", async () => {
      const res = await request(server)
        .get(endpoint)
        .send();
      expect(res.status).toBe(200);
    });
  });
});
