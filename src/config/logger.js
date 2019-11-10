const { createLogger, format, transports } = require("winston");
require("express-async-errors");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
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
});

process.on("unhandledRejection", ex => {
  throw ex;
});

module.exports = logger;
