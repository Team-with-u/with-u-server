const mongoose = require("mongoose");

const {
  INCIDENT_STEP,
} = require("../utils/enums");

const incidentLogSchema = new mongoose.Schema({
  incidentId: {
    type: String,
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
  step: {
    type: String,
    enum: Object.values(INCIDENT_STEP),
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("IncidentLog", incidentLogSchema);
