require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

/*
 MQTT 연결
*/
const mqttClient = mqtt.connect(
  process.env.MQTT_URL || "mqtt://localhost:1883"
);

/*
 연결 성공
*/
mqttClient.on("connect", () => {
  console.log("✅ WITH-U MQTT 연결 성공");

  mqttClient.subscribe("with-u/#");

  console.log("📡 MQTT 구독 시작");
});

/*
 메시지 수신
*/
mqttClient.on("message", (topic, message) => {
  console.log("\n📨 메시지 도착");

  console.log("토픽:", topic);

  const data = message.toString();

  console.log("데이터:", data);
});

/*
 테스트 API
*/
app.get("/", (req, res) => {
  res.send("WITH-U SERVER RUNNING");
});

app.listen(PORT, () => {
  console.log(`🚀 서버 실행: ${PORT}`);
});