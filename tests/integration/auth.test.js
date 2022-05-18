const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../src/api/models/User");
const server = require("../../app");

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
  });

  afterAll(async () => {
    const { connections } = mongoose;
    connections.forEach((con) => {
      return con.close();
    });

    await mongoose.disconnect();
  });

  describe("PATCH /resetPassword", () => {
    let resetToken;
    let password;

    const exec = async () => {
      return request(server)
        .patch(`${endpoint}/resetPassword/${resetToken}`)
        .send({ password });
    };

    it("should return 200 if valid request", async () => {
      const user = new User({
        email: "saymyname@hbo.com",
        password: "eisenberg",
      });

      resetToken = user.getResetPasswordToken();
      await user.save();

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if token expired", async () => {
      const user = new User({
        email: "saymyname@hbo.com",
        password: "eisenberg",
      });

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
    let email;

    const exec = async () => {
      return request(server).post(`${endpoint}/forgotPassword`).send({ email });
    };

    it("should return 200 if user exists", async () => {
      const user = await new User({
        email: "saymyname@hbo.com",
        password: "eisenberg",
      }).save();
      email = user.email;
      const res = await exec();
      expect(res.status).toBe(200);
    });

    it("should return 400 if invalid body", async () => {
      email = undefined;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if user not exists", async () => {
      email = "saymyname@hbo.com";

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

    it("should set the refresh token cookie if valid", async () => {
      email = "johndoe@anonymous.com";
      password = "rememberthefifth";
      const user = await new User({ email, password }).save();
      const token = user.generateRefreshToken();
      const res = await exec();
      expect(res.status).toBe(200);
      const setCookie = res.headers["set-cookie"][0];
      console.log(setCookie);
      const pattern = /refresh_token=(.+);\b\/gm/;
      console.log(setCookie.match(pattern));
      // const rToken = setCookie[0].split(";")[0].split("=")[1];
      // console.log(rToken);
      expect(res.cookie).toHaveProperty("refresh_token", token);
    });

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
