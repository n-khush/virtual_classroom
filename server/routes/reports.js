const express = require("express");
const ClassroomLog = require("../models/ClassroomLog");

const router = express.Router();

router.get("/:roomId", async (req, res) => {
  try {
    const logs = await ClassroomLog.findOne({ roomId: req.params.roomId }).populate("events.user");
    res.json(logs || { message: "No logs found for this room" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
