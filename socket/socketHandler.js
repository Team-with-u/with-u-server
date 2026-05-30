function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("🔌 프론트 연결됨");

    socket.on("disconnect", () => {
      console.log("❌ 프론트 연결 종료");
    });
  });
}

module.exports = setupSocket;