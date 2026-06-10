const mqtt = require("mqtt");

const {
  updateWorker,
  getWorkers,
  markWorkerResponded,
} = require("../services/workerService");

const {
  createIncident,
  addIncidentStep,
  resolveIncident,
  getIncidentTimeline,
  getLastIncidentStep,
  getActiveIncidents,
  getActiveIncidentByWorkerId,
} = require("../services/incidentService");

const {
  WORKER_STATUS,
  INCIDENT_STEP,
} = require("../utils/enums");

function connectMQTT(io) {
  const client = mqtt.connect(process.env.MQTT_BROKER_URL);

  async function emitIncidentState(incidentId) {
    const workers = await getWorkers();
    const activeIncidents = await getActiveIncidents();

    io.emit("workers:update", workers);
    io.emit("incidents:active", activeIncidents);

    if (incidentId) {
      const timeline = await getIncidentTimeline(incidentId);

      io.emit("incidents:timeline", {
        incidentId,
        timeline,
      });
    }
  }

  client.on("connect", () => {
    console.log("✅ MQTT 연결 성공");

    client.subscribe(
      ["with-u/workers/status", "with-u/worker/response"],
      () => {
        console.log("📡 MQTT 구독 시작");
      }
    );
  });

  client.on("message", async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());

      console.log("📨 메시지 도착");
      console.log(data);

      if (topic === "with-u/workers/status") {
        // 작업자 상태 업데이트
        await updateWorker(data);

        let activeIncident = await getActiveIncidentByWorkerId(data.workerId);

        if (data.status === WORKER_STATUS.DANGER) {
          if (!activeIncident) {
            activeIncident = await createIncident(data);
          }
        }

        if (data.status === WORKER_STATUS.WARNING && activeIncident) {
          const lastStep = await getLastIncidentStep(activeIncident.incidentId);

          if (!lastStep || lastStep.step !== INCIDENT_STEP.ACKNOWLEDGED) {
            await addIncidentStep(
              activeIncident.incidentId,
              INCIDENT_STEP.ACKNOWLEDGED,
              "관리자 확인 완료"
            );
          }
        }

        if (data.status === WORKER_STATUS.NORMAL && activeIncident) {
          await resolveIncident(activeIncident.incidentId);
        }

        await emitIncidentState(activeIncident && activeIncident.incidentId);

        console.log("✅ 실시간 데이터 전송 완료");
        return;
      }

      if (topic === "with-u/worker/response") {
        if (data.response !== "safe") {
          console.log("ℹ️ 작업자 응답이 safe가 아니어서 무시됨");
          return;
        }

        await markWorkerResponded(data.workerId);
        io.emit("workers:update", await getWorkers());

        const activeIncident = await getActiveIncidentByWorkerId(data.workerId);

        if (!activeIncident) {
          console.log("ℹ️ 활성 사고는 없지만 작업자 응답 상태를 업데이트함");
          return;
        }

        const lastStep = await getLastIncidentStep(activeIncident.incidentId);

        if (!lastStep || lastStep.step !== INCIDENT_STEP.WORKER_RESPONDED) {
          await addIncidentStep(
            activeIncident.incidentId,
            INCIDENT_STEP.WORKER_RESPONDED,
            "작업자 응답 확인"
          );
        }

        await resolveIncident(activeIncident.incidentId);

        await emitIncidentState(activeIncident.incidentId);

        console.log("✅ 작업자 응답 처리 및 사고 자동 종료 완료");
      }
    } catch (error) {
      console.error("❌ MQTT 메시지 처리 실패");
      console.error(error);
    }
  });
}

module.exports = connectMQTT;
