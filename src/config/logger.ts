import { createLogger, format, transports } from 'winston'
require('express-async-errors')

const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug'

export const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.json()
  ),
  transports: [
    /**
     * - Write to all logs with level `info` and below to the Console.
     */
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  ],
  exceptionHandlers: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  ]
})

process.on('unhandledRejection', (ex: any) => {
  throw ex
})
