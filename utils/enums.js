const WORKER_STATUS = {
  NORMAL: "normal",
  WARNING: "warning",
  DANGER: "danger",
};

const INCIDENT_STATUS = {
  ACTIVE: "active",
  PROCESSING: "processing",
  RESOLVED: "resolved",
};

const INCIDENT_STEP = {
  DETECTED: "detected",
  ACKNOWLEDGED: "acknowledged",
  CALLING_WORKER: "calling_worker",
  WORKER_RESPONDED: "worker_responded",
  DISPATCHING_TEAM: "dispatching_team",
  RESOLVED: "resolved",
};

module.exports = {
  WORKER_STATUS,
  INCIDENT_STATUS,
  INCIDENT_STEP,
};
