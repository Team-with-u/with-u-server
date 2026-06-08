const express = require("express");

const router = express.Router();

const workerController = require("../controllers/workerController");

router.get("/", workerController.getWorkers);
router.get("/:workerId/incidents", workerController.getWorkerIncidentHistory);

module.exports = router;