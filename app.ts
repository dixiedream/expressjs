import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import localization from './src/config/localization'
import profiler from './src/middleware/profiler'
import { UserDocument } from './src/api/models/User'

export interface AppResponseLocals {
  user?: UserDocument
  token?: string
}

export type AppResponse<T = any> = express.Response<T, AppResponseLocals>

const app = express()

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line global-require
  require('./src/config/prod')(app)
}

//  Middlewares
app.use(cors({ credentials: true }))
app.use(localization)
app.use(cookieParser())
app.use(profiler)
app.use(express.json({ limit: '1mb' })) // Change limit body size

require('./src/api/routes/index')(app)
require('./src/config/db')()

export default app
