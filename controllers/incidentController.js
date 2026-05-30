const {
  getIncidentLogs,
} = require("../services/incidentService");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

exports.getIncidentLogs = async (req, res) => {
  try {
    const incidentLogs = await getIncidentLogs();

    return sendSuccess(res, incidentLogs);
  } catch (error) {
    console.error("❌ 사고 로그 조회 실패");
    console.error(error);

    return sendError(res, "사고 로그 조회 실패");
  }
};