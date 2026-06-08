const {
  getWorkers,
  getWorkerIncidentHistory,
} = require("../services/workerService");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

exports.getWorkers = async (req, res) => {
  try {
    const workers = await getWorkers();

    return sendSuccess(res, workers);
  } catch (error) {
    console.error("❌ 작업자 조회 실패");
    console.error(error);

    return sendError(res, "작업자 조회 실패");
  }
};

exports.getWorkerIncidentHistory = async (req, res) => {
  try {
    const { workerId } = req.params;
    const history = await getWorkerIncidentHistory(Number(workerId));

    return sendSuccess(res, history);
  } catch (error) {
    console.error("❌ 작업자별 사고 이력 조회 실패");
    console.error(error);

    return sendError(res, "작업자별 사고 이력 조회 실패");
  }
};