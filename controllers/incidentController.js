const {
  getActiveIncidents,
  getIncidentTimeline,
} = require("../services/incidentService");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

exports.getActiveIncidents = async (req, res) => {
  try {
    const incidents = await getActiveIncidents();

    return sendSuccess(res, incidents);
  } catch (error) {
    console.error("❌ 활성 사고 조회 실패");
    console.error(error);

    return sendError(res, "활성 사고 조회 실패");
  }
};

exports.getIncidentTimeline = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const timeline = await getIncidentTimeline(incidentId);

    return sendSuccess(res, timeline);
  } catch (error) {
    console.error("❌ 사고 타임라인 조회 실패");
    console.error(error);

    return sendError(res, "사고 타임라인 조회 실패");
  }
};