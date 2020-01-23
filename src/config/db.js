const mongoose = require("mongoose");
const logger = require("../config/logger");

const { NODE_ENV, MONGO_CONNECTION } = process.env;

const mongoConnection = MONGO_CONNECTION || "mongodb://db:27017/expressmongo";

const autoIndex = NODE_ENV === "development";

// Db connection
module.exports = () => {
  mongoose
    .connect(mongoConnection, {
      useCreateIndex: true,
      autoIndex,
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      if (NODE_ENV === "development") {
        logger.info("DB_CONNECTED", { dbConnection: mongoConnection });
      } else {
        logger.info("DB_CONNECTED");
      }
    })
    .catch(err => {
      logger.error("DB_CONNECTION_FAILED", err);
    });
};
