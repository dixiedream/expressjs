import { createLogger, format, transports } from 'winston'

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'warning')

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
  console.log(ex)
  throw ex
})
