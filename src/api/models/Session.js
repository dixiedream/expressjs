const mongoose = require("mongoose");

const { Schema } = mongoose;

const SessionSchema = new Schema(
  {
    refreshToken: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

exports.Session = mongoose.model("Session", SessionSchema);
