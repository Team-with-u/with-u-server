const mqtt = require("mqtt");

const {
  updateWorker,
  getWorkers,
} = require("../services/workerService");

const {
  addIncidentLog,
  getIncidentLogs,
} = require("../services/incidentService");

const WORKER_STATUS = require("../constants/status");

function connectMQTT(io) {
  const client = mqtt.connect(process.env.MQTT_BROKER_URL);

  client.on("connect", () => {
    console.log("✅ MQTT 연결 성공");

    client.subscribe("with-u/alerts/fall", () => {
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

      // 사고 로그 저장
      if (data.status === WORKER_STATUS.DANGER) {
        await addIncidentLog({
          workerId: data.workerId,
          workerName: data.workerName,
          message: `${data.location} 쓰러짐 감지`,
          type: WORKER_STATUS.DANGER,
        });
      }

      // 프론트 실시간 전송
      const workers = await getWorkers();
      const incidentLogs = await getIncidentLogs();

      io.emit("worker-update", workers);
      io.emit("incident-logs", incidentLogs);

      console.log("✅ 실시간 데이터 전송 완료");
    } catch (error) {
      console.error("❌ MQTT 메시지 처리 실패");
      console.error(error);
    }
  });
}

module.exports = connectMQTT;