const mongoose = require("mongoose");

const {
  WORKER_STATUS,
} = require("../utils/enums");

const workerSchema = new mongoose.Schema({
  workerId: {
    type: Number,
    unique: true,
    required: true,
  },
  workerName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(WORKER_STATUS),
    required: true,
    default: WORKER_STATUS.NORMAL,
  },
  location: {
    type: String,
    required: true,
  },
  lastMovement: {
    type: String,
    required: true,
  },
  incidentCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Worker", workerSchema);