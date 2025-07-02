import mongoose from 'mongoose'
import { verify as jwtVerify } from '../../../../src/shared/jwt.js'
import { UserModel } from '../../../../src/api/models/User.js'
import { describe, it } from "node:test"
import assert from 'node:assert'
import tokenUtils from '../../../../src/shared/token.js'

const { JWT_PRIVATE_KEY, JWT_REFRESH_PRIVATE_KEY } = process.env

const payload = {
  _id: new mongoose.Types.ObjectId().toString() // toHexString(),
}

describe('token.getResetPasswordToken', () => {
  it('should return ', () => {

    const hash = tokenUtils.generateResetPasswordToken('randomDataString')
    assert.ok(hash !== undefined)
    assert.ok(typeof hash === "string")
  })
})

describe('token.generateAuthToken', () => {
  it('should return a valid JWT', () => {
    const user = new UserModel(payload)
    const token = tokenUtils.generateAuthToken(user._id.toString())
    const { data } = jwtVerify(token, JWT_PRIVATE_KEY ?? 'NOT_DEFINED')
    assert.strictEqual(data.user, payload._id)
  })
})

describe('token.generateRefreshToken', () => {
  it('should return a valid JWT', () => {
    const user = new UserModel(payload)
    const token = tokenUtils.generateRefreshToken(user._id.toString())
    const { data } = jwtVerify(token, JWT_REFRESH_PRIVATE_KEY ?? 'NOT_DEFINED')
    assert.strictEqual(data.user, payload._id)
  })
})
