const {
  getIncidentLogs,
} = require("../services/incidentService");

exports.getIncidentLogs = (req, res) => {
  res.json(getIncidentLogs());
};