const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roomId: { type: String, required: true },
  role: { type: String, required: true }, // "teacher" or "student"
  socketId: { type: String },
});

module.exports = mongoose.model("User", UserSchema);
