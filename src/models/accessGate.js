const mongoose = require("mongoose");

const accessGateSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const AccessGate = mongoose.model("AccessGate", accessGateSchema);

module.exports = AccessGate;
