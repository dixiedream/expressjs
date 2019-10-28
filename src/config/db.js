const mongoose = require("mongoose");

const mongoConnection =
  process.env.MONGO_CONNECTION || "mongodb://db:27017/expressmongo";

// Db connection
mongoose
  .connect(mongoConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to db");
  })
  .catch(err => {
    console.error(err);
  });
