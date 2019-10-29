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
  defaultMeta: { service: SERVICE_NAME || "Expressjs boilerplate" },
  transports: [
    /**
     * - Write to all logs with level `info` and below to `combined.log`.
     * - Write all logs `error` (and below) to `error.log`.
     * - Write all logs with level `info` and below to MongoDB
     */
    new transports.File({
      filename: "logs/error.log",
      level: "error"
    }),
    new transports.File({ filename: "logs/combined.log" }),
    new transports.MongoDB({
      db: MONGO__LOG_CONNECTION || "mongodb://db:27017/expressmongo_log",
      format: format.combine(format.json(), format.metadata())
    })
  ],
  exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log" })]
});

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  );
  logger.exceptions.handle(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  );
}

process.on("unhandledRejection", ex => {
  throw ex;
});

module.exports = logger;
