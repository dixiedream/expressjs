import { EventEmitter } from 'node:events'
import { logger } from '../config/logger.js'
import { Request, Response, NextFunction } from "express"

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

export default (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  res.once('finish', () => {
    profiles.emit('route', { req, elapsedMS: Date.now() - start })
  })

  next()
}
