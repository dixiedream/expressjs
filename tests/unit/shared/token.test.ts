import mongoose from 'mongoose'
import { verify as jwtVerify } from '../../../src/shared/jwt.js'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import tokenUtils from '../../../src/shared/tokenUtils.js'

const { JWT_PRIVATE_KEY, JWT_REFRESH_PRIVATE_KEY } = process.env

const id = new mongoose.Types.ObjectId().toString() // toHexString(),

describe('token.getResetPasswordToken', () => {
  it('should return ', () => {
    const hash = tokenUtils.generateResetPasswordToken('randomDataString')
    assert.ok(hash !== undefined)
    assert.ok(typeof hash === 'string')
  })
})

describe('token.generateAuthToken', () => {
  it('should return a valid JWT', () => {
    const token = tokenUtils.generateAuthToken(id, 60 * 1000)
    const verified = jwtVerify(token, JWT_PRIVATE_KEY ?? 'NOT_DEFINED')
    assert.strictEqual(verified.data.user, id)
  })
})

describe('token.generateRefreshToken', () => {
  it('should return a valid JWT', () => {
    const token = tokenUtils.generateRefreshToken(id, 60 * 1000)
    const { data } = jwtVerify(token, JWT_REFRESH_PRIVATE_KEY ?? 'NOT_DEFINED')
    assert.strictEqual(data.user, id)
  })
})
