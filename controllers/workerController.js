const {
  getWorkers,
} = require("../services/workerService");

exports.getWorkers = (req, res) => {
  res.json(getWorkers());
};