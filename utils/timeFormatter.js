function getCurrentTime(date = new Date()) {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

module.exports = getCurrentTime;