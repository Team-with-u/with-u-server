const Worker = require("../models/Worker");
const Incident = require("../models/Incident");
const IncidentLog = require("../models/IncidentLog");

const {
  WORKER_STATUS,
} = require("../utils/enums");

function formatIncidentLog(log) {
  return {
    step: log.step,
    message: log.message,
    createdAt: log.createdAt,
  };
}

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

async function restoreWorkerStatus(workerId) {
  return Worker.findOneAndUpdate(
    { workerId },
    { status: WORKER_STATUS.NORMAL },
    { new: true }
  );
}

async function getWorkerIncidentHistory(workerId) {
  const incidents = await Incident.find({ workerId })
    .sort({ createdAt: -1 });

  const incidentsWithLogs = await Promise.all(
    incidents.map(async (incident) => {
      const logs = await IncidentLog.find({ incidentId: incident.incidentId })
        .sort({ createdAt: 1 });

      const startedAt = incident.startedAt || incident.createdAt;
      const resolvedAt = incident.resolvedAt;

      return {
        incidentId: incident.incidentId,
        status: incident.currentStatus,
        location: incident.location,
        createdAt: startedAt,
        resolvedAt,
        duration: resolvedAt
          ? Math.max(0, Math.floor((resolvedAt.getTime() - startedAt.getTime()) / 1000))
          : null,
        logs: logs.map(formatIncidentLog),
      };
    })
  );

  const worker = await Worker.findOne({ workerId });
  const workerName = worker?.workerName || incidents[0]?.workerName || null;

  return {
    workerId,
    workerName,
    totalCount: incidentsWithLogs.length,
    incidents: incidentsWithLogs,
  };
}

module.exports = {
  updateWorker,
  getWorkers,
  restoreWorkerStatus,
  getWorkerIncidentHistory,
};