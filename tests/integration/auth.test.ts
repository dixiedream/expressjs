import request from 'supertest'
import mongoose from 'mongoose'
import { UserModel } from '../../src/api/models/User.js'
import { Session } from '../../src/api/models/Session.js'
import server from '../../app.js'
import tokenUtils from '../../src/shared/token.js'
import assert from 'node:assert'
import config from '../../src/config/config.js'
import { describe, afterEach, after, it } from 'node:test'
import { sendMail } from '../../src/shared/sendMail.js'
import moment from 'moment'

const rTokenName = config.refreshToken.name

const endpoint = '/api/auth'

describe(endpoint, () => {
  afterEach(async () => {
    await UserModel.deleteMany({})
    await Session.deleteMany({})
  })

  after(async () => {
    const { connections } = mongoose
    connections.forEach(async (con) => {
      return await con.close()
    })

    await mongoose.disconnect()
  })

  describe('PATCH /resetPassword', () => {
    const userData = {
      email: 'saymyname@hbo.com',
      password: 'Eisenb3rg£'
    }

    let resetToken: string | undefined
    let password: string | undefined

    const exec = async () => {
      return await request(server)
        .patch(`${endpoint}/resetPassword/${resetToken}`)
        .send({ password })
    }

    it('should return 200 if valid request', async () => {
      const user = new UserModel(userData)

      const clear = 'pippo'
      user.resetPasswordToken = tokenUtils.generateResetPasswordToken(clear)
      user.resetPasswordTokenExpiration = moment().add({ minutes: 10 }).toDate()

      await user.save()

      const res = await exec()
      assert.strictEqual(res.status, 400)
    })

    it('should return 400 if token expired', async () => {
      const user = new UserModel(userData)

      const clear = 'pippo'
      user.resetPasswordToken = tokenUtils.generateResetPasswordToken(clear)
      user.resetPasswordTokenExpiration = new Date()
      await user.save()

      const res = await exec()
      assert.strictEqual(res.status, 400)
    })

    it('should return 400 if token is not valid', async () => {
      resetToken = 'abc'
      password = undefined
      const res = await exec()
      assert.strictEqual(res.status, 400)
    })
  })

  describe('POST /forgotPassword', () => {
    const userData = {
      email: 'saymyname@hbo.com',
      password: 'Eisenb3rg£'
    }

    let email: string | undefined

    const exec = async () => {
      return await request(server).post(`${endpoint}/forgotPassword`).send({ email })
    }

    it('should return 200 if user exists', async (t) => {
      const fakeSendMail = t.mock.fn(sendMail)
      fakeSendMail.mock.mockImplementation(async (args) => {
        console.log(args)
      })
      const user = await new UserModel(userData).save()
      email = user.email
      const res = await request(server).post(`${endpoint}/forgotPassword`).send({ email })
      assert.strictEqual(res.status, 200)
    })

    it('should return 400 if invalid body', async () => {
      email = ''
      const res = await exec()
      assert.strictEqual(res.status, 400)
    })

    it('should return 400 if user not exists', async () => {
      email = userData.email
      const res = await exec()
      assert.strictEqual(res.status, 400)
    })
  })

  describe('POST /', () => {
    let email: string | undefined
    let password: string | undefined

    const exec = async () => {
      return await request(server).post(endpoint).send({ email, password })
    }

    it('should set the refresh token cookie as httpOnly if valid', async () => {
      email = 'johndoe@anonymous.com'
      password = 'Eisenb3rg$'
      await new UserModel({ email, password }).save()
      const res = await exec()
      const setCookie = res.headers['set-cookie'][0]
      assert.notStrictEqual(setCookie.search('HttpOnly'), -1)
    })

    it('should set the refresh token cookie if valid', async () => {
      email = 'johndoe@anonymous.com'
      password = 'Eisenb3rg$'
      await new UserModel({ email, password }).save()
      const res = await exec()
      const setCookie = res.headers['set-cookie'][0]
      const rToken = setCookie.split(';')[0].split('=')[1]
      assert.notStrictEqual(rToken, '')
    })

    it('should return the access token if valid', async () => {
      email = 'johndoe@anonymous.com'
      password = 'Eisenb3rg$'
      await new UserModel({ email, password }).save()
      const res = await exec()
      assert.ok(res.body.token !== undefined)
    })

    it('should return 200 if valid', async () => {
      email = 'johndoe@anonymous.com'
      password = 'Eisenb3rg$'
      await new UserModel({ email, password }).save()
      const res = await exec()
      assert.strictEqual(res.status, 200)
    })

    it('should return 400 if password is not valid', async () => {
      email = 'johndoe@anonymous.com'
      await new UserModel({ email, password: 'vforrevenge' }).save()
      password = 'rememberthefifth'
      const res = await exec()
      assert.strictEqual(res.status, 400)
    })

    it('should return 400 if user not exist', async () => {
      email = 'johndoe@anonymous.com'
      password = 'Eisenb3rg£'
      const res = await exec()
      assert.strictEqual(res.status, 400)
    })

    it('should return 400 if invalid data', async () => {
      email = 'abc.com'
      password = undefined
      const res = await exec()
      assert.strictEqual(res.status, 400)
    })
  })

  describe('DELETE /', () => {
    const exec = async () => {
      return await request(server).delete(endpoint).send()
    }

    it('should clear refresh_token cookie if valid', async () => {
      const res = await exec()
      const setCookie = res.headers['set-cookie'][0]
      const rToken = setCookie.split(';')[0].split('=')[1]
      assert.strictEqual(rToken, '')
    })

    it('should return 204 if valid', async () => {
      const res = await exec()
      assert.strictEqual(res.status, 204)
    })
  })

  describe('POST /refresh', () => {
    let cookie: string

    const exec = async () => {
      return await request(server)
        .post(`${endpoint}/refresh`)
        .set('Cookie', [cookie])
        .send()
    }

    it('should refresh the access token if valid', async () => {
      const user = await new UserModel({
        email: 'abc@abc.com',
        password: 'Eisenb3rg$'
      }).save()

      const refreshToken = tokenUtils.generateRefreshToken(user._id.toString())
      await Session.create({ refreshToken, user: user._id })
      cookie = `${rTokenName}=${refreshToken}`
      const token = tokenUtils.generateAuthToken(user._id.toString(), 1)
      const res = await exec()
      assert.notStrictEqual(res.body.token, token)
    })

    it('should return 403 if token not been found', async () => {
      const user = new UserModel({
        email: 'abc@abc.com',
        password: 'Eisenb3rg$'
      })
      const refreshToken = tokenUtils.generateRefreshToken(user._id.toString())
      cookie = `${rTokenName}=${refreshToken}`
      const res = await exec()
      assert.strictEqual(res.status, 403)
    })

    it('should return 200 if token is valid', async () => {
      const user = await new UserModel({
        email: 'abc@abc.com',
        password: 'Eisenb3rg$'
      }).save()

      const refreshToken = tokenUtils.generateRefreshToken(user._id.toString())
      await Session.create({ refreshToken, user: user._id })
      cookie = `${rTokenName}=${refreshToken}`
      const res = await exec()
      assert.strictEqual(res.status, 200)
    })

    it('should return 403 if token is not valid', async () => {
      cookie = `${rTokenName}=pippo`
      const res = await exec()
      assert.strictEqual(res.status, 403)
    })

    it('should return 401 if no token is provided', async () => {
      cookie = ''
      const res = await exec()
      assert.strictEqual(res.status, 401)
    })
  })
})
