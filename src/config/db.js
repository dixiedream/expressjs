const mongoose = require("mongoose");
const logger = require("../config/logger");

let mongoConnection =
  process.env.MONGO_CONNECTION || "mongodb://db:27017/expressmongo";

if (process.env.NODE_ENV === "test") {
  mongoConnection =
    process.env.MONGO_TEST_CONNECTION ||
    "mongodb://db:27017/expressmongo_tests";
}

// Db connection
module.exports = () => {
  mongoose
    .connect(mongoConnection, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      logger.info("DB_CONNECTED", { dbConnection: mongoConnection });
    });
};
