const incidentLogs = [];

function addIncidentLog(log) {
  incidentLogs.unshift(log);
}

function getIncidentLogs() {
  return incidentLogs;
}

module.exports = {
  addIncidentLog,
  getIncidentLogs,
};