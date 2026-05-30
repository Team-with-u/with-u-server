const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  workerId: Number,
  workerName: String,
  status: String,
  location: String,
  lastMovement: String,
  incidentCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Worker", workerSchema);