const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const localization = require('./src/config/localization')
const profiler = require('./src/middleware/profiler')

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

module.exports = app
