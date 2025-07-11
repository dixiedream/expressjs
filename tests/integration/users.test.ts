import request from 'supertest'
import mongoose from 'mongoose'
import { UserModel } from '../../src/api/models/User.js'
import { Session } from '../../src/api/models/Session.js'
import ROLES from '../../src/config/roles.js'
import server from '../../app.js'
import tokenUtils from '../../src/shared/tokenUtils.js'
import { describe, afterEach, after, it } from 'node:test'
import assert from 'node:assert'
import passwordUtils, { PASSWORD_ENCRYPTION_DEFAULT } from '../../src/shared/passwordUtils.js'

const { ADMIN, USER } = ROLES
const endpoint = '/api/users'

describe(endpoint, () => {
  after(async () => {
    const { connections } = mongoose
    connections.forEach(async (con) => {
      return await con.close()
    })
    await mongoose.disconnect()
  })

  describe('POST /', () => {
    let email: string | undefined
    let password: string | undefined

    const exec = async () => {
      return await request(server).post(endpoint).send({ email, password })
    }

    afterEach(async () => {
      await UserModel.deleteMany({})
      await Session.deleteMany({})
    })

    it('should save the user if valid', async () => {
      email = 'johndoe@anonymous.com'
      password = 'Eisenb3rg$'
      await exec()
      const user = await UserModel.findOne({ email })
      assert.notEqual(user, null)
    })

    it('should return the user if valid', async () => {
      email = 'johndoe@anonymous.com'
      password = 'Eisenb3rg$'
      const res = await exec()
      assert.strictEqual(res.body.email, email)
    })

    it('should not register the user if invalid email', async () => {
      email = 'johndoe'
      password = undefined
      const res = await exec()
      assert.strictEqual(res.status, 400)
    })

    it('should not register the user if empty body', async () => {
      email = undefined
      password = undefined
      const res = await request(server).post(endpoint).send()

      assert.strictEqual(res.status, 400)
    })
  })

  describe('GET /', () => {
    const userData = {
      email: 'johndoe@anonymous.com',
      password: 'Eisenb3rg£',
      role: ADMIN
    }

    let token: string | undefined

    const exec = async () => {
      return await request(server)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .send()
    }

    afterEach(async () => {
      await UserModel.deleteMany({})
      await Session.deleteMany({})
    })

    it('should contain the right fields', async () => {
      const user = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(user._id.toString())
      const res = await exec()
      const fetchedUser = res.body[0]
      assert.strictEqual(fetchedUser.email, userData.email)
      assert.strictEqual(fetchedUser.role, userData.role)
      assert.ok(fetchedUser._id !== undefined)
      assert.ok(fetchedUser.password === undefined)
    })

    it('should return an array of users if valid', async () => {
      const user = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(user._id.toString())
      const res = await exec()
      assert.ok(res.body.length !== undefined)
      assert.ok(res.body.length > 0)
    })

    it('should return 200 if token is still valid', async () => {
      const user = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(user._id.toString())
      let res = await exec()
      assert.strictEqual(res.status, 200)
      res = await exec()
      assert.strictEqual(res.status, 200)
    })

    it('should return 200 if logged in', async () => {
      const user = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(user._id.toString())
      const res = await exec()
      assert.strictEqual(res.status, 200)
    })

    it('should return 403 if not admin', async () => {
      const user = await new UserModel({ ...userData, role: USER }).save()
      token = tokenUtils.generateAuthToken(user._id.toString())
      const res = await exec()
      assert.strictEqual(res.status, 403)
    })

    it('should return 403 if token is invalid', async () => {
      const user = await new UserModel(userData).save()
      token = `a${tokenUtils.generateAuthToken(user._id.toString())}cZ`
      const res = await exec()
      assert.strictEqual(res.status, 403)
    })

    it('should return 403 if token is expired', async () => {
      const user = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(user._id.toString(), 1)
      const res = await exec()
      assert.strictEqual(res.status, 403)
    })

    it('should return 401 if user is no token is provided', async () => {
      const res = await request(server).get(endpoint)
      assert.strictEqual(res.status, 401)
    })
  })

  describe('GET /me', () => {
    const userData = {
      email: 'johndoe@anonymous.com',
      password: 'Eisenb3rg£',
      role: USER
    }

    let token: string | undefined

    const exec = async () => {
      return request(server)
        .get(`${endpoint}/me`)
        .set('Authorization', `Bearer ${token}`)
        .send()
    }

    afterEach(async () => {
      await UserModel.deleteMany({})
      await Session.deleteMany({})
    })

    it('should return email and role if valid', async () => {
      const user = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(user._id.toString())
      const res = await exec()
      assert.strictEqual(res.body.email, user.email)
      assert.strictEqual(res.body.role, user.role)
    })

    it('should return 200 if token is still valid', async () => {
      const user = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(user._id.toString())
      let res = await exec()
      assert.strictEqual(res.status, 200)
      res = await exec()
      assert.strictEqual(res.status, 200)
    })

    it('should return 200 if logged in', async () => {
      const user = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(user._id.toString())
      const res = await exec()
      assert.strictEqual(res.status, 200)
    })

    it('should return 403 if token is invalid', async () => {
      const user = await new UserModel(userData).save()
      token = `a${tokenUtils.generateAuthToken(user._id.toString())}cZ`
      const res = await exec()
      assert.strictEqual(res.status, 403)
    })

    it('should return 403 if token is expired', async () => {
      const user = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(user._id.toString(), 1)
      const res = await exec()
      assert.strictEqual(res.status, 403)
    })

    it('should return 401 if user is no token is provided', async () => {
      const res = await request(server).get(`${endpoint}/me`)
      assert.strictEqual(res.status, 401)
    })
  })

  describe('PATCH /me', () => {
    const userData = {
      email: 'johndoe@anonymous.com',
      password: 'Eisenb3rg$',
      role: USER
    }

    const exec = async (body: Record<string, any>, token?: string) => {
      return request(server)
        .patch(`${endpoint}/me`)
        .set('Authorization', `Bearer ${token}`)
        .send(body)
    }

    afterEach(async () => {
      await UserModel.deleteMany({})
      await Session.deleteMany({})
    })

    it('should change the password if old and new are provided', async () => {
      const newPassword = 'Anonym0u$'
      const user = await new UserModel(userData).save()
      const token = tokenUtils.generateAuthToken(user._id.toString())
      const body = { oldPassword: userData.password, newPassword }
      await exec(body, token)
      const updatedUser = await UserModel.findOne({
        email: userData.email
      })

      assert.notStrictEqual(updatedUser?.password, user.password)
      const match = await passwordUtils.verify(newPassword, updatedUser?.password ?? 'WRONG', updatedUser?.passwordEncryption ?? PASSWORD_ENCRYPTION_DEFAULT)
      assert.ok(match)
    })

    it('should return email and role if valid', async () => {
      const user = await new UserModel(userData).save()
      const token = tokenUtils.generateAuthToken(user._id.toString())
      const res = await exec({}, token)
      assert.strictEqual(res.body.email, user.email)
      assert.strictEqual(res.body.role, user.role)
    })

    it('should return 200 if token is still valid', async () => {
      const user = await new UserModel(userData).save()
      const token = tokenUtils.generateAuthToken(user._id.toString())
      let res = await exec({}, token)
      assert.strictEqual(res.status, 200)
      user.password = userData.password
      await user.save()
      res = await exec({}, token)
      assert.strictEqual(res.status, 200)
    })

    it('should return 200 if logged in', async () => {
      const user = await new UserModel(userData).save()
      const token = tokenUtils.generateAuthToken(user._id.toString())
      const res = await exec({}, token)
      assert.strictEqual(res.status, 200)
    })

    it('should return 403 if token is invalid', async () => {
      const user = await new UserModel(userData).save()
      const token = `a${tokenUtils.generateAuthToken(user._id.toString())}cZ`
      const res = await exec({ }, token)
      assert.strictEqual(res.status, 403)
    })

    it('should return 403 if token is expired', async () => {
      const user = await new UserModel(userData).save()
      const token = tokenUtils.generateAuthToken(user._id.toString(), 1)
      const res = await exec({}, token)
      assert.strictEqual(res.status, 403)
    })

    it('should return 401 if user is no token is provided', async () => {
      const res = await request(server).patch(`${endpoint}/me`)
      assert.strictEqual(res.status, 401)
    })
  })

  describe('PATCH /:id', () => {
    const userData = {
      email: 'johndoe@anonymous.com',
      password: 'Eisenb3rg£',
      role: ADMIN
    }

    let token: string | undefined
    let userID: string | mongoose.Types.ObjectId

    const exec = async () => {
      return request(server)
        .patch(`${endpoint}/${userID}`)
        .set('Authorization', `Bearer ${token}`)
        .send()
    }

    afterEach(async () => {
      await UserModel.deleteMany({})
      await Session.deleteMany({})
    })

    it('should return 400 if user not exist', async () => {
      const admin = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(admin._id.toString())
      userID = new mongoose.Types.ObjectId()
      const res = await exec()
      assert.strictEqual(res.status, 400)
    })

    it('should return 400 if user id is not valid', async () => {
      const user = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(user._id.toString())
      userID = 'fakeUserId'
      const res = await exec()
      assert.strictEqual(res.status, 400)
    })

    it('should return 200 if token is still valid', async () => {
      const admin = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(admin._id.toString())
      const user = await new UserModel({
        ...userData,
        email: 'luke@jediknights.org',
        role: USER
      }).save()
      userID = user._id
      let res = await exec()
      assert.strictEqual(res.status, 200)
      user.password = userData.password
      await user.save()
      res = await exec()
      assert.strictEqual(res.status, 200)
    })

    it('should return 200 if logged in', async () => {
      const admin = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(admin._id.toString())
      const user = await new UserModel({
        ...userData,
        email: 'luke@jediknights.org',
        role: USER
      }).save()
      userID = user._id
      const res = await exec()
      assert.strictEqual(res.status, 200)
    })

    it('should return 403 if token is invalid', async () => {
      const user = await new UserModel(userData).save()
      token = `a${tokenUtils.generateAuthToken(user._id.toString())}cZ`
      const res = await exec()
      assert.strictEqual(res.status, 403)
    })

    it('should return 403 if token is expired', async () => {
      const user = await new UserModel(userData).save()
      token = tokenUtils.generateAuthToken(user._id.toString(), 1)
      const res = await exec()
      assert.strictEqual(res.status, 403)
    })

    it('should return 401 if user is no token is provided', async () => {
      const res = await request(server).patch(`${endpoint}/abcabc`)
      assert.strictEqual(res.status, 401)
    })
  })
})
