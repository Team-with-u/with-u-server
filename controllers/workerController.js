const {
  getWorkers,
} = require("../services/workerService");

exports.getWorkers = async (req, res) => {
  try {
    const workers = await getWorkers();

    res.json(workers);
  } catch (error) {
    console.error("❌ 작업자 조회 실패");
    console.error(error);

    res.status(500).json({ message: "작업자 조회 실패" });
  }
};