const mongoose = require("mongoose");

const {
  INCIDENT_STATUS,
  WORKER_STATUS,
} = require("../utils/enums");

const incidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    unique: true,
    required: true,
  },
  workerId: {
    type: Number,
    required: true,
  },
  workerName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  currentStatus: {
    type: String,
    enum: Object.values(INCIDENT_STATUS),
    default: INCIDENT_STATUS.ACTIVE,
  },
  dangerLevel: {
    type: String,
    enum: Object.values(WORKER_STATUS),
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("Incident", incidentSchema);