const { User } = require("../../../src/api/models/User");
const 

describe("user.generateAuthToken", () => {
  it("should return a valid JWT", () => {
    const user = new User({ _id: 1 });
    const token = user.generateAuthToken();
  });
});
