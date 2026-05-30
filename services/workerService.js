const workers = [];

function updateWorker(data) {
  const index = workers.findIndex(
    (worker) => worker.workerId === data.workerId
  );

  const workerData = {
    workerId: data.workerId,
    workerName: data.workerName,
    status: data.status,
    location: data.location,
    lastMovement: "방금 전",
    incidentCount: data.incidentCount || 0,
  };

  if (index !== -1) {
    workers[index] = workerData;
  } else {
    workers.push(workerData);
  }
}

function getWorkers() {
  return workers;
}

module.exports = {
  updateWorker,
  getWorkers,
};