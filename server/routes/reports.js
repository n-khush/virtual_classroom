const express = require("express");
const ClassroomLog = require("../models/ClassroomLog");
const User = require("../models/User");
const router = express.Router();

router.get("/:roomId", async (req, res) => {
  try {
    // Find all logs for the given roomId
    const logs = await ClassroomLog.find({ roomId: req.params.roomId }).sort({ createdAt: -1 });

    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: "No logs found for this room" });
    }

    // Populate the user details (name and role) for each event
    for (let log of logs) {
      for (let event of log.events) {
        const user = await User.findOne({ roomId: req.params.roomId, name: event.userName });
        if (user) {
          event.userRole = user.role; // Attach role to the event
        }
      }
    }

    // Return the logs with events
    res.json(logs);
  } catch (error) {
    console.error("Error fetching classroom logs:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
