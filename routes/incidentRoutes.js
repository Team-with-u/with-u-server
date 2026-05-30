const express = require("express");

const router = express.Router();

const incidentController = require("../controllers/incidentController");

router.get("/", incidentController.getActiveIncidents);
router.get("/active", incidentController.getActiveIncidents);
router.get("/:incidentId/timeline", incidentController.getIncidentTimeline);

module.exports = router;