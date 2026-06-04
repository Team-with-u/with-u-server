const express = require("express");

const router = express.Router();

const incidentController = require("../controllers/incidentController");

router.get("/", incidentController.getActiveIncidents);
router.get("/active", incidentController.getActiveIncidents);
router.get("/:incidentId/timeline", incidentController.getIncidentTimeline);
router.post("/:incidentId/ack", incidentController.acknowledgeIncident);
router.post("/:incidentId/call", incidentController.callWorker);
router.post("/:incidentId/dispatch", incidentController.dispatchIncident);
router.post("/:incidentId/resolve", incidentController.resolveIncidentController);

module.exports = router;