const { createLogger, format, transports } = require("winston");
require("winston-mongodb");
require("express-async-errors");

const { SERVICE_NAME, MONGO__LOG_CONNECTION } = process.env;

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.json()
  ),
  defaultMeta: { service: SERVICE_NAME || "Expressjs" },
  transports: [
    /**
     * - Write to all logs with level `info` and below to the Console.
     * - Write all logs with level `info` and below to MongoDB
     */
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    }),
    new transports.MongoDB({
      db: MONGO__LOG_CONNECTION || "mongodb://db:27017/expressmongo_log",
      format: format.combine(format.json(), format.metadata())
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
