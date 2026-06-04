require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const swaggerUi = require("swagger-ui-express");

const connectDB = require("./db/connectDB");

const connectMQTT = require("./mqtt/mqttClient");

const workerRoutes = require("./routes/workerRoutes");
const incidentRoutes = require("./routes/incidentRoutes");

const setupSocket = require("./socket/socketHandler");
const swaggerSpec = require("./utils/swagger");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/workers", workerRoutes);
app.use("/api/incidents", incidentRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

setupSocket(io);

connectMQTT(io);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 WITH-U 서버 실행 : ${PORT}`);
});