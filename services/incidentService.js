const Incident = require("../models/Incident");
const getCurrentTime = require("../utils/timeFormatter");

async function addIncidentLog(log) {
  const incidentData = {
    workerId: log.workerId,
    workerName: log.workerName,
    message: log.message,
    type: log.type,
  };

  return Incident.create(incidentData);
}

async function getIncidentLogs() {
  const incidents = await Incident.find().sort({ createdAt: -1 });

  return incidents.map((incident) => ({
    time: getCurrentTime(new Date(incident.createdAt)),
    workerId: incident.workerId,
    workerName: incident.workerName,
    message: incident.message,
    type: incident.type,
  }));
}

module.exports = {
  addIncidentLog,
  getIncidentLogs,
};