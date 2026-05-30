const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
  workerId: Number,
  workerName: String,
  message: String,
  type: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Incident", incidentSchema);