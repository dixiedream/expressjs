/* eslint-env jest */
const mongoose = require('mongoose')
const { verify: jwtVerify } = require('../../../../src/shared/jwt')
const { User } = require('../../../../src/api/models/User')

const { JWT_PRIVATE_KEY, JWT_REFRESH_PRIVATE_KEY } = process.env

const payload = {
  _id: new mongoose.Types.ObjectId().toString() // toHexString(),
}

describe('User.getResetPasswordToken', () => {
  it('should set the user token and its expiration', () => {
    const user = new User(payload)

    user.getResetPasswordToken()
    expect(user.resetPasswordToken).not.toBe(undefined)
    expect(user.resetPasswordTokenExpiration).not.toBe(undefined)
  })
})

describe('User.generateAuthToken', () => {
  it('should return a valid JWT', () => {
    const user = new User(payload)
    const token = user.generateAuthToken()
    const { data } = jwtVerify(token, JWT_PRIVATE_KEY)
    expect(data.user).toBe(payload._id)
  })
})

describe('User.generateRefreshToken', () => {
  it('should return a valid JWT', () => {
    const user = new User(payload)
    const token = user.generateRefreshToken()
    const { data } = jwtVerify(token, JWT_REFRESH_PRIVATE_KEY)
    expect(data.user).toBe(payload._id)
  })
})
