const { EventEmitter } = require('events')
const logger = require('../config/logger')

const profiles = new EventEmitter()
const { NODE_ENV } = process.env

profiles.on('route', ({ req, elapsedMS }) => {
  const profilerData = {
    method: req.method,
    URL: req.url,
    time: `${elapsedMS}ms`
  }

  if (elapsedMS > 500) {
    logger.warn('PROFILER', profilerData)
  } else if (elapsedMS > 1000) {
    logger.error('PROFILER', profilerData)
  } else if (NODE_ENV === 'development') {
    logger.info('PROFILER', profilerData)
  }
})

const profiler = (req, res, next) => {
  const start = new Date()
  res.once('finish', () => {
    profiles.emit('route', { req, elapsedMS: new Date() - start })
  })

  next()
}

module.exports = profiler
