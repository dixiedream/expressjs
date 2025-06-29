import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import localization from './src/config/localization.js'
import profiler from './src/middleware/profiler.js'
import { UserDocument } from './src/api/models/User.js'
import setupRouter from "./src/api/routes/index.js"
import setupDb from "./src/config/db.js"


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

setupRouter(app)
await setupDb()

export default app
