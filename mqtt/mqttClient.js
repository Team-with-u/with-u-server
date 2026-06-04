const mqtt = require("mqtt");

const {
  updateWorker,
  getWorkers,
} = require("../services/workerService");

const {
  createIncident,
  addIncidentStep,
  resolveIncident,
  getIncidentTimeline,
  getLastIncidentStep,
  getActiveIncidents,
  getActiveIncidentByWorker,
} = require("../services/incidentService");

const {
  WORKER_STATUS,
  INCIDENT_STEP,
} = require("../utils/enums");

function connectMQTT(io) {
  const client = mqtt.connect(process.env.MQTT_BROKER_URL);

  client.on("connect", () => {
    console.log("✅ MQTT 연결 성공");

    client.subscribe("with-u/workers/status", () => {
      console.log("📡 MQTT 구독 시작");
    });
  });

  client.on("message", async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());

      console.log("📨 메시지 도착");
      console.log(data);

      // 작업자 상태 업데이트
      await updateWorker(data);

      let activeIncident = await getActiveIncidentByWorker(data.workerId);

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

      // 프론트 실시간 전송
      const workers = await getWorkers();
      const activeIncidents = await getActiveIncidents();

      io.emit("workers:update", workers);
      io.emit("incidents:active", activeIncidents);

      if (activeIncident) {
        const timeline = await getIncidentTimeline(activeIncident.incidentId);

        io.emit("incidents:timeline", {
          incidentId: activeIncident.incidentId,
          timeline,
        });
      }

      console.log("✅ 실시간 데이터 전송 완료");
    } catch (error) {
      console.error("❌ MQTT 메시지 처리 실패");
      console.error(error);
    }
  });
}

module.exports = connectMQTT;