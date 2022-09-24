/* eslint-env jest */
const request = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { User } = require('../../src/api/models/User')
const { Session } = require('../../src/api/models/Session')
const { ADMIN, USER } = require('../../src/config/roles')

const server = require('../../app')

const endpoint = '/api/users'

describe(endpoint, () => {
  afterEach(async () => {
    await User.deleteMany({})
    await Session.deleteMany({})
  })

  afterAll(async () => {
    const { connections } = mongoose
    connections.forEach((con) => {
      return con.close()
    })
    return mongoose.disconnect()
  })

  describe('POST /', () => {
    let email
    let password

    const exec = async () => {
      return request(server).post(endpoint).send({ email, password })
    }

    it('should save the user if valid', async () => {
      email = 'johndoe@anonymous.com'
      password = 'Eisenb3rg$'
      await exec()
      const user = await User.findOne({ email })
      expect(user).not.toBeNull()
    })

    it('should return the user if valid', async () => {
      email = 'johndoe@anonymous.com'
      password = 'Eisenb3rg$'
      const res = await exec()
      expect(res.body).toHaveProperty('email', email)
    })

    it('should not register the user if invalid email', async () => {
      email = 'johndoe'
      password = undefined
      const res = await exec()
      expect(res.status).toBe(400)
    })

    it('should not register the user if empty body', async () => {
      email = undefined
      password = undefined
      const res = await request(server).post(endpoint)

      expect(res.status).toBe(400)
    })
  })

  describe('GET /', () => {
    const userData = {
      email: 'johndoe@anonymous.com',
      password: 'Eisenb3rg£',
      role: ADMIN
    }

    let token

    const exec = async () => {
      return request(server)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .send()
    }

    it('should contain the right fields', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken()
      const res = await exec()
      const fetchedUser = res.body[0]
      expect(fetchedUser).toHaveProperty('email', userData.email)
      expect(fetchedUser).toHaveProperty('role', userData.role)
      expect(fetchedUser).toHaveProperty('_id')
      expect(fetchedUser).not.toHaveProperty('password')
    })

    it('should return an array of users if valid', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken()
      const res = await exec()
      expect(res.body).toBeInstanceOf(Array)
      expect(res.body.length).toBeGreaterThan(0)
    })

    it('should return 200 if token is still valid', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken()
      let res = await exec()
      expect(res.status).toBe(200)
      res = await exec()
      expect(res.status).toBe(200)
    })

    it('should return 200 if logged in', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken()
      const res = await exec()
      expect(res.status).toBe(200)
    })

    it('should return 403 if not admin', async () => {
      const user = await new User({ ...userData, role: USER }).save()
      token = user.generateAuthToken()
      const res = await exec()
      expect(res.status).toBe(403)
    })

    it('should return 403 if token is invalid', async () => {
      const user = await new User(userData).save()
      token = `a${user.generateAuthToken()}cZ`
      const res = await exec()
      expect(res.status).toBe(403)
    })

    it('should return 403 if token is expired', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken('1ms')
      const res = await exec()
      expect(res.status).toBe(403)
    })

    it('should return 401 if user is no token is provided', async () => {
      const res = await request(server).get(endpoint)
      expect(res.status).toBe(401)
    })
  })

  describe('GET /me', () => {
    const userData = {
      email: 'johndoe@anonymous.com',
      password: 'Eisenb3rg£',
      role: USER
    }

    let token

    const exec = async () => {
      return request(server)
        .get(`${endpoint}/me`)
        .set('Authorization', `Bearer ${token}`)
        .send()
    }

    it('should return email and role if valid', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken()
      const res = await exec()
      expect(res.body).toHaveProperty('email', user.email)
      expect(res.body).toHaveProperty('role', user.role)
    })

    it('should return 200 if token is still valid', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken()
      let res = await exec()
      expect(res.status).toBe(200)
      res = await exec()
      expect(res.status).toBe(200)
    })

    it('should return 200 if logged in', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken()
      const res = await exec()
      expect(res.status).toBe(200)
    })

    it('should return 403 if token is invalid', async () => {
      const user = await new User(userData).save()
      token = `a${user.generateAuthToken()}cZ`
      const res = await exec()
      expect(res.status).toBe(403)
    })

    it('should return 403 if token is expired', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken('1ms')
      const res = await exec()
      expect(res.status).toBe(403)
    })

    it('should return 401 if user is no token is provided', async () => {
      const res = await request(server).get(`${endpoint}/me`)
      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /me', () => {
    const userData = {
      email: 'johndoe@anonymous.com',
      password: 'Eisenb3rg$',
      role: USER
    }

    let token
    let body

    const exec = async () => {
      return request(server)
        .patch(`${endpoint}/me`)
        .set('Authorization', `Bearer ${token}`)
        .send(body)
    }

    it('should change the password if old and new are provided', async () => {
      const newPassword = 'Anonym0u$'
      const user = await new User(userData).save()
      token = user.generateAuthToken()
      body = { oldPassword: userData.password, newPassword }
      await exec()
      const updatedUser = await User.findOne({
        email: userData.email
      })

      expect(updatedUser.password).not.toBe(user.password)
      const match = await bcrypt.compare(newPassword, updatedUser.password)
      expect(match).toBe(true)
    })

    it('should return email and role if valid', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken()
      const res = await exec()
      expect(res.body).toHaveProperty('email', user.email)
      expect(res.body).toHaveProperty('role', user.role)
    })

    it('should return 200 if token is still valid', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken()
      let res = await exec()
      expect(res.status).toBe(200)
      user.password = userData.password
      await user.save()
      res = await exec()
      expect(res.status).toBe(200)
    })

    it('should return 200 if logged in', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken()
      const res = await exec()
      expect(res.status).toBe(200)
    })

    it('should return 403 if token is invalid', async () => {
      const user = await new User(userData).save()
      token = `a${user.generateAuthToken()}cZ`
      const res = await exec()
      expect(res.status).toBe(403)
    })

    it('should return 403 if token is expired', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken('1ms')
      const res = await exec()
      expect(res.status).toBe(403)
    })

    it('should return 401 if user is no token is provided', async () => {
      const res = await request(server).patch(`${endpoint}/me`)
      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /:id', () => {
    const userData = {
      email: 'johndoe@anonymous.com',
      password: 'Eisenb3rg£',
      role: ADMIN
    }

    let token
    let userID

    const exec = async () => {
      return request(server)
        .patch(`${endpoint}/${userID}`)
        .set('Authorization', `Bearer ${token}`)
        .send()
    }

    it('should return 400 if user not exist', async () => {
      const admin = await new User(userData).save()
      token = admin.generateAuthToken()
      userID = mongoose.Types.ObjectId()
      const res = await exec()
      expect(res.status).toBe(400)
    })

    it('should return 400 if user id is not valid', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken()
      userID = 'fakeUserId'
      const res = await exec()
      expect(res.status).toBe(400)
    })

    it('should return 200 if token is still valid', async () => {
      const admin = await new User(userData).save()
      token = admin.generateAuthToken()
      const user = await new User({
        ...userData,
        email: 'luke@jediknights.org',
        role: USER
      }).save()
      userID = user._id
      let res = await exec()
      expect(res.status).toBe(200)
      user.password = userData.password
      await user.save()
      res = await exec()
      expect(res.status).toBe(200)
    })

    it('should return 200 if logged in', async () => {
      const admin = await new User(userData).save()
      token = admin.generateAuthToken()
      const user = await new User({
        ...userData,
        email: 'luke@jediknights.org',
        role: USER
      }).save()
      userID = user._id
      const res = await exec()
      expect(res.status).toBe(200)
    })

    it('should return 403 if token is invalid', async () => {
      const user = await new User(userData).save()
      token = `a${user.generateAuthToken()}cZ`
      const res = await exec()
      expect(res.status).toBe(403)
    })

    it('should return 403 if token is expired', async () => {
      const user = await new User(userData).save()
      token = user.generateAuthToken('1ms')
      const res = await exec()
      expect(res.status).toBe(403)
    })

    it('should return 401 if user is no token is provided', async () => {
      const res = await request(server).patch(`${endpoint}/abcabc`)
      expect(res.status).toBe(401)
    })
  })
})
