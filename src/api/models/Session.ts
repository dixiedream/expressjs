import mongoose from 'mongoose'

const { Schema } = mongoose

const SessionSchema = new Schema({
  refreshToken: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    expires: 60 * 60 * 24 * 265,
    default: Date.now
  }
})

export const Session = mongoose.model('Session', SessionSchema)
