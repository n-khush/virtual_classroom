const mongoose = require("mongoose");

const classroomLogSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true },
    events: [
      {
        type: { type: String, enum: ["entry", "leave", "start", "end"], required: true },
        userRole: { type: String, enum: ["student", "teacher"], required: true },
        userName: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const ClassroomLog = mongoose.model("ClassroomLog", classroomLogSchema);

module.exports = ClassroomLog;
