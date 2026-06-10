const mongoose = require("mongoose");

const {
  WORKER_STATUS,
  WORKER_CALL_STATUS,
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
  callStatus: {
    type: String,
    enum: Object.values(WORKER_CALL_STATUS),
    default: WORKER_CALL_STATUS.IDLE,
  },
  lastCallAt: {
    type: Date,
  },
  lastResponseAt: {
    type: Date,
  },
});

workerSchema.virtual("responseSeconds").get(function () {
  if (!this.lastCallAt || !this.lastResponseAt) {
    return null;
  }

  return Math.max(
    0,
    Math.floor((this.lastResponseAt.getTime() - this.lastCallAt.getTime()) / 1000)
  );
});

workerSchema.set("toJSON", { virtuals: true });
workerSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Worker", workerSchema);
