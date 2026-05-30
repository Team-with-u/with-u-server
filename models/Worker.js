const mongoose = require("mongoose");

const WORKER_STATUS = require("../constants/status");

const workerSchema = new mongoose.Schema({
  workerId: Number,
  workerName: String,
  status: {
    type: String,
    enum: Object.values(WORKER_STATUS),
  },
  location: String,
  lastMovement: String,
  incidentCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Worker", workerSchema);