const mqtt = require("mqtt");

const {
  updateWorker,
  getWorkers,
} = require("../services/workerService");

const {
  addIncidentLog,
  getIncidentLogs,
} = require("../services/incidentService");

const getCurrentTime = require("../utils/timeFormatter");

function connectMQTT(io) {
  const client = mqtt.connect(process.env.MQTT_BROKER);

  client.on("connect", () => {
    console.log("✅ MQTT 연결 성공");

    client.subscribe("with-u/alerts/fall", () => {
      console.log("📡 MQTT 구독 시작");
    });
  });

  client.on("message", (topic, message) => {
    const data = JSON.parse(message.toString());

    console.log("📨 메시지 도착");
    console.log(data);

    // 작업자 상태 업데이트
    updateWorker(data);

    // 사고 로그 저장
    if (data.status === "fall_detected") {
      addIncidentLog({
        time: getCurrentTime(),
        workerName: data.workerName,
        message: `${data.location} 쓰러짐 감지`,
        type: "danger",
      });
    }

    // 프론트 실시간 전송
    io.emit("worker-update", getWorkers());

    io.emit("incident-logs", getIncidentLogs());
  });
}

module.exports = connectMQTT;