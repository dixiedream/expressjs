const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../src/api/models/User");
const { Session } = require("../../src/api/models/Session");
const server = require("../../app");
const {
  refreshToken: { name: rTokenName },
} = require("../../src/config/config");

const endpoint = "/api/auth";

const sendMailMock = jest.fn();
jest.mock("nodemailer");

// eslint-disable-next-line import/order
const nodemailer = require("nodemailer");

nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

describe(endpoint, () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    nodemailer.createTransport.mockClear();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  afterAll(async () => {
    const { connections } = mongoose;
    connections.forEach((con) => {
      return con.close();
    });

    await mongoose.disconnect();
  });

  describe("PATCH /resetPassword", () => {
    const userData = {
      email: "saymyname@hbo.com",
      password: "Eisenb3rg£",
    };

    let resetToken;
    let password;

    const exec = async () => {
      return request(server)
        .patch(`${endpoint}/resetPassword/${resetToken}`)
        .send({ password });
    };

    it("should return 200 if valid request", async () => {
      const user = new User(userData);

      resetToken = user.getResetPasswordToken();
      await user.save();

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if token expired", async () => {
      const user = new User(userData);

      resetToken = user.getResetPasswordToken();

      user.resetPasswordTokenExpiration = new Date();
      await user.save();

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if token is not valid", async () => {
      resetToken = "abc";
      password = undefined;
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });

  describe("POST /forgotPassword", () => {
    const userData = {
      email: "saymyname@hbo.com",
      password: "Eisenb3rg£",
    };

    let email;

    const exec = async () => {
      return request(server).post(`${endpoint}/forgotPassword`).send({ email });
    };

    it("should return 200 if user exists", async () => {
      const user = await new User(userData).save();
      email = user.email;
      const res = await exec();
      expect(res.status).toBe(200);
    });

    it("should return 400 if invalid body", async () => {
      email = "";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if user not exists", async () => {
      email = userData.email;
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });

  describe("POST /", () => {
    let email;
    let password;

    const exec = async () => {
      return request(server).post(endpoint).send({ email, password });
    };

    it("should set the refresh token cookie as httpOnly if valid", async () => {
      email = "johndoe@anonymous.com";
      password = "Eisenb3rg$";
      await new User({ email, password }).save();
      const res = await exec();
      const setCookie = res.headers["set-cookie"][0];
      expect(setCookie.search("HttpOnly")).not.toBe(-1);
    });

    it("should set the refresh token cookie if valid", async () => {
      email = "johndoe@anonymous.com";
      password = "Eisenb3rg$";
      await new User({ email, password }).save();
      const res = await exec();
      const setCookie = res.headers["set-cookie"][0];
      const rToken = setCookie.split(";")[0].split("=")[1];
      expect(rToken).not.toBe("");
    });

    it("should return the access token if valid", async () => {
      email = "johndoe@anonymous.com";
      password = "Eisenb3rg$";
      await new User({ email, password }).save();
      const res = await exec();
      expect(res.body).toHaveProperty("token");
    });

    it("should return 200 if valid", async () => {
      email = "johndoe@anonymous.com";
      password = "Eisenb3rg$";
      await new User({ email, password }).save();
      const res = await exec();
      expect(res.status).toBe(200);
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
      password = "Eisenb3rg£";
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

  describe("DELETE /", () => {
    const exec = async () => {
      return request(server).delete(endpoint).send();
    };

    it("should clear refresh_token cookie if valid", async () => {
      const res = await exec();
      const setCookie = res.headers["set-cookie"][0];
      const rToken = setCookie.split(";")[0].split("=")[1];
      expect(rToken).toBe("");
    });

    it("should return 204 if valid", async () => {
      const res = await exec();
      expect(res.status).toBe(204);
    });
  });

  describe("POST /refresh", () => {
    let cookie;

    const exec = async () => {
      return request(server)
        .post(`${endpoint}/refresh`)
        .set("Cookie", [cookie])
        .send();
    };

    it("should refresh the access token if valid", async () => {
      const user = await new User({
        email: "abc@abc.com",
        password: "Eisenb3rg$",
      }).save();

      const refreshToken = user.generateRefreshToken();
      await Session.create({ refreshToken, user: user._id });
      cookie = `${rTokenName}=${refreshToken}`;
      const token = user.generateAuthToken("1ms");
      const res = await exec();
      expect(res.body.token).not.toBe(token);
    });

    it("should return 403 if token not been found", async () => {
      const user = await new User({
        email: "abc@abc.com",
        password: "Eisenb3rg$",
      });
      const refreshToken = user.generateRefreshToken();
      cookie = `${rTokenName}=${refreshToken}`;
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 200 if token is valid", async () => {
      const user = await new User({
        email: "abc@abc.com",
        password: "Eisenb3rg$",
      }).save();

      const refreshToken = user.generateRefreshToken();
      await Session.create({ refreshToken, user: user._id });
      cookie = `${rTokenName}=${refreshToken}`;
      const res = await exec();
      expect(res.status).toBe(200);
    });

    it("should return 403 if token is not valid", async () => {
      cookie = `${rTokenName}=pippo`;
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 401 if no token is provided", async () => {
      cookie = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
  });
});
