const mongoose = require("mongoose");

const Incident = require("../models/Incident");
const IncidentLog = require("../models/IncidentLog");
const getCurrentTime = require("../utils/timeFormatter");

const {
  INCIDENT_STATUS,
  INCIDENT_STEP,
  WORKER_STATUS,
} = require("../utils/enums");

function formatLog(log) {
  return {
    incidentId: log.incidentId,
    workerId: log.workerId,
    workerName: log.workerName,
    step: log.step,
    message: log.message,
    time: getCurrentTime(new Date(log.createdAt)),
    createdAt: log.createdAt,
  };
}

async function createIncident(data) {
  const incidentId = new mongoose.Types.ObjectId().toString();

  const incident = await Incident.create({
    incidentId,
    workerId: data.workerId,
    workerName: data.workerName,
    location: data.location,
    currentStatus: INCIDENT_STATUS.ACTIVE,
    dangerLevel: data.status || WORKER_STATUS.DANGER,
    startedAt: new Date(),
  });

  await IncidentLog.create({
    incidentId,
    workerId: data.workerId,
    workerName: data.workerName,
    step: INCIDENT_STEP.DETECTED,
    message: `${data.location} 쓰러짐 감지`,
  });

  return incident;
}

async function addIncidentStep(incidentId, step, message, options = {}) {
  const incident = await Incident.findOne({ incidentId });

  if (!incident) {
    return null;
  }

  if (
    incident.currentStatus !== INCIDENT_STATUS.RESOLVED
    && options.updateStatus !== false
  ) {
    incident.currentStatus = INCIDENT_STATUS.PROCESSING;
    await incident.save();
  }

  return IncidentLog.create({
    incidentId,
    workerId: incident.workerId,
    workerName: incident.workerName,
    step,
    message,
  });
}

async function resolveIncident(incidentId) {
  const incident = await Incident.findOne({ incidentId });

  if (!incident || incident.currentStatus === INCIDENT_STATUS.RESOLVED) {
    return null;
  }

  incident.currentStatus = INCIDENT_STATUS.RESOLVED;
  incident.resolvedAt = new Date();
  await incident.save();

  await addIncidentStep(
    incidentId,
    INCIDENT_STEP.RESOLVED,
    "상황 종료",
    { updateStatus: false }
  );

  return incident;
}

async function getIncidentTimeline(incidentId) {
  const logs = await IncidentLog.find({ incidentId })
    .sort({ createdAt: 1 });

  return logs.map(formatLog);
}

async function getLastIncidentStep(incidentId) {
  return IncidentLog.findOne({ incidentId })
    .sort({ createdAt: -1 });
}

async function getActiveIncidents() {
  return Incident.find({
    currentStatus: { $ne: INCIDENT_STATUS.RESOLVED },
  }).sort({ startedAt: -1 });
}

async function getActiveIncidentByWorker(workerId) {
  return Incident.findOne({
    workerId,
    currentStatus: { $ne: INCIDENT_STATUS.RESOLVED },
  }).sort({ startedAt: -1 });
}

async function getIncidentById(incidentId) {
  return Incident.findOne({ incidentId });
}

module.exports = {
  createIncident,
  addIncidentStep,
  resolveIncident,
  getIncidentTimeline,
  getLastIncidentStep,
  getActiveIncidents,
  getActiveIncidentByWorker,
  getIncidentById,
};