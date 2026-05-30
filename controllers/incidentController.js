const {
  getIncidentLogs,
} = require("../services/incidentService");

exports.getIncidentLogs = async (req, res) => {
  try {
    const incidentLogs = await getIncidentLogs();

    res.json(incidentLogs);
  } catch (error) {
    console.error("❌ 사고 로그 조회 실패");
    console.error(error);

    res.status(500).json({ message: "사고 로그 조회 실패" });
  }
};