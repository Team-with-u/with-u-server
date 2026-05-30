const Worker = require("../models/Worker");

const {
  WORKER_STATUS,
} = require("../utils/enums");

function normalizeStatus(status) {
  if (Object.values(WORKER_STATUS).includes(status)) {
    return status;
  }

  return WORKER_STATUS.NORMAL;
}

async function updateWorker(data) {
  const workerData = {
    workerId: data.workerId,
    workerName: data.workerName,
    status: normalizeStatus(data.status),
    location: data.location,
    lastMovement: "방금 전",
    incidentCount: data.incidentCount || 0,
  };

  return Worker.findOneAndUpdate(
    { workerId: data.workerId },
    workerData,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function getWorkers() {
  return Worker.find().sort({ workerId: 1 });
}

module.exports = {
  updateWorker,
  getWorkers,
};