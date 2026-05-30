const {
  getWorkers,
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