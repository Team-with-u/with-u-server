const {
  getActiveIncidents,
  getIncidentTimeline,
  addIncidentStep,
  resolveIncident,
  getIncidentById,
} = require("../services/incidentService");

const {
  INCIDENT_STEP,
} = require("../utils/enums");

const {
  publishMessage,
} = require("../utils/mqttPublisher");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

async function emitIncidentUpdates(req, incidentId) {
  const io = req.app.get("io");

  if (!io) {
    return;
  }

  const activeIncidents = await getActiveIncidents();

  io.emit("incidents:active", activeIncidents);
  io.emit("incident-active", activeIncidents);

  if (incidentId) {
    const timeline = await getIncidentTimeline(incidentId);

    io.emit("incidents:timeline", {
      incidentId,
      timeline,
    });
    io.emit("incident-timeline", {
      incidentId,
      timeline,
    });
  }
}

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

exports.acknowledgeIncident = async (req, res) => {
  try {
    const { incidentId } = req.params;

    await addIncidentStep(
      incidentId,
      INCIDENT_STEP.ACKNOWLEDGED,
      "관리자 확인 완료"
    );

    await emitIncidentUpdates(req, incidentId);

    return sendSuccess(res, { incidentId });
  } catch (error) {
    console.error("❌ 관리자 확인 처리 실패");
    console.error(error);

    return sendError(res, "관리자 확인 처리 실패");
  }
};

exports.dispatchIncident = async (req, res) => {
  try {
    const { incidentId } = req.params;

    await addIncidentStep(
      incidentId,
      INCIDENT_STEP.DISPATCHING_TEAM,
      "현장 대응팀 이동 중"
    );

    await emitIncidentUpdates(req, incidentId);

    return sendSuccess(res, { incidentId });
  } catch (error) {
    console.error("❌ 현장 대응 처리 실패");
    console.error(error);

    return sendError(res, "현장 대응 처리 실패");
  }
};

exports.resolveIncidentController = async (req, res) => {
  try {
    const { incidentId } = req.params;

    await resolveIncident(incidentId);
    await emitIncidentUpdates(req, incidentId);

    return sendSuccess(res, { incidentId });
  } catch (error) {
    console.error("❌ 상황 종료 처리 실패");
    console.error(error);

    return sendError(res, "상황 종료 처리 실패");
  }
};

exports.callWorker = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const incident = await getIncidentById(incidentId);

    if (!incident) {
      return sendError(res, "사고를 찾을 수 없습니다", 404);
    }

    await publishMessage("with-u/worker/call", {
      workerId: incident.workerId,
    });

    await addIncidentStep(
      incidentId,
      INCIDENT_STEP.CALLING_WORKER,
      "작업자 호출 신호 전송"
    );

    await emitIncidentUpdates(req, incidentId);

    return sendSuccess(res, { incidentId });
  } catch (error) {
    console.error("❌ 작업자 호출 처리 실패");
    console.error(error);

    return sendError(res, "작업자 호출 처리 실패");
  }
};