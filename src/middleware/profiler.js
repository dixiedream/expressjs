const { EventEmitter } = require("events");
const logger = require("../config/logger");

const profiles = new EventEmitter();

profiles.on("route", ({ req, elapsedMS }) => {
  logger.info("PROFILER", {
    method: req.method,
    URL: req.url,
    time: `${elapsedMS}ms`
  });
});

const profiler = (req, res, next) => {
  const start = new Date();
  res.once("finish", () => {
    profiles.emit("route", { req, elapsedMS: new Date() - start });
  });

  next();
};

module.exports = profiler;
