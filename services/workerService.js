const Worker = require("../models/Worker");

async function updateWorker(data) {
  const workerData = {
    workerId: data.workerId,
    workerName: data.workerName,
    status: data.status,
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