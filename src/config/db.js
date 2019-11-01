const mongoose = require("mongoose");
const logger = require("../config/logger");

const mongoConnection =
  process.env.MONGO_CONNECTION || "mongodb://db:27017/expressmongo";

// Db connection
module.exports = () => {
  mongoose
    .connect(mongoConnection, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      logger.info("DB_CONNECTED", { dbConnection: mongoConnection });
    })
    .catch(err => {
      logger.error("DB_CONNECTION_FAILED", err);
    });
};
