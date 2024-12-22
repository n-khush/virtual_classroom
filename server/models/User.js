const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    roomId: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher"], required: true },
    socketId: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
