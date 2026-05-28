require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(cors());
app.use(express.json());

/*
 HTTP 서버 생성
*/
const server = http.createServer(app);

/*
 Socket.IO 설정
*/
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/*
 환경변수
*/
const PORT = process.env.PORT || 4000;
const MQTT_URL = process.env.MQTT_URL || "mqtt://localhost:1883";

/*
 MQTT 연결
*/
const mqttClient = mqtt.connect(MQTT_URL);

/*
 MQTT 연결 성공
*/
mqttClient.on("connect", () => {
  console.log("✅ WITH-U MQTT 연결 성공");

  /*
   전체 WITH-U 토픽 구독
  */
  mqttClient.subscribe("with-u/#", (err) => {
    if (err) {
      console.log("❌ MQTT 구독 실패");
    } else {
      console.log("📡 MQTT 구독 시작");
    }
  });
});

/*
 MQTT 메시지 수신
*/
mqttClient.on("message", (topic, message) => {
  console.log("\n📨 메시지 도착");

  console.log("토픽:", topic);

  try {
    /*
     문자열 → JSON 변환
    */
    const data = JSON.parse(message.toString());

    console.log("데이터:", data);

    /*
     프론트로 실시간 데이터 전달
    */
    io.emit("worker-data", data);

    /*
     사고 감지
    */
    if (data.status === "fall_detected") {
      io.emit("fall-alert", data);

      console.log("🚨 사고 알림 전송");
    }
  } catch (error) {
    console.log("❌ JSON 파싱 오류");
  }
});

/*
 MQTT 오류 처리
*/
mqttClient.on("error", (error) => {
  console.log("❌ MQTT 오류:", error.message);
});

/*
 Socket 연결 확인
*/
io.on("connection", (socket) => {
  console.log("🟢 관리자 연결됨");

  socket.on("disconnect", () => {
    console.log("🔴 관리자 연결 종료");
  });
});

/*
 테스트 API
*/
app.get("/", (req, res) => {
  res.send("WITH-U SERVER RUNNING");
});

/*
 서버 실행
*/
server.listen(PORT, () => {
  console.log(`🚀 서버 실행: ${PORT}`);
});