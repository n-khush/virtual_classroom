const mongoose = require("mongoose");

const ClassroomLogSchema = new mongoose.Schema({
  roomId: { type: String, required: true }, // Unique identifier for the room
  roomName: { type: String, required: true }, // Display name for the room
  createdAt: { type: Date, default: Date.now },
  events: [
    {
      type: { type: String, required: true }, // "entry", "start", "leave", etc.
      userRole: String,
      userName: String,
      timestamp: { type: Date, required: true },
    },
  ],
});

module.exports = mongoose.model("ClassroomLog", ClassroomLogSchema);
