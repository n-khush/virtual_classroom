const User = require("../models/User");
const ClassroomLog = require("../models/ClassroomLog");
const activeClasses = new Map();

const handleSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle joinRoom event
    socket.on("joinRoom", async ({ room, name, role }) => {
      if (!name || !role || !room) {
        socket.emit("error", { message: "Invalid room or user data." });
        return;
      }
      const roomId = room; // Use a consistent roomId
      const existingLog = await ClassroomLog.findOne({ roomName: room });

      if (!existingLog && role !== "student") {
        await ClassroomLog.create({
          roomId,
          roomName: room,
          events: [],
          createdAt: new Date(),
        });
      }

      const user = await User.findOneAndUpdate(
        { name, roomId },
        { socketId: socket.id, role },
        { upsert: true, new: true }
      );

      socket.join(roomId);
      console.log(`${name} joined room: ${roomId}`);

      const entryLog = {
        type: "entry",
        userRole: role,
        userName: name,
        timestamp: new Date(),
      };

      await ClassroomLog.findOneAndUpdate(
        { roomId },
        { $push: { events: entryLog } }
      );

      const users = await User.find({ roomId });
      const isClassStarted = activeClasses.has(roomId);

      io.to(roomId).emit("updateClassroom", {
        students: users.filter((u) => u.role === "student").map((u) => u.name),
        teachers: users.filter((u) => u.role === "teacher").map((u) => u.name),
        isClassStarted,
      });
    });

    socket.on("startClass", async ({ room }) => {
      const roomId = room;

      if (activeClasses.has(roomId)) {
        socket.emit("error", { message: "Class is already active." });
        return;
      }

      activeClasses.set(roomId, true);

      const startLog = {
        type: "start",
        timestamp: new Date(),
      };

      await ClassroomLog.findOneAndUpdate(
        { roomId },
        { $push: { events: startLog } }
      );
      const users = await User.find({ roomId});
      console.log("triggering update classroom......")
      io.to(roomId).emit("updateClassroom", {
        isClassStarted: true,
        students: users.filter((u) => u.role === "student").map((u) => u.name),
        teachers: users.filter((u) => u.role === "teacher").map((u) => u.name),
      });
    });

    socket.on("endClass", async ({ room }) => {
      const roomId = room;

      if (!activeClasses.has(roomId)) {
        socket.emit("error", { message: "Class is not active." });
        return;
      }

      activeClasses.delete(roomId);

      const endLog = {
        type: "end",
        timestamp: new Date(),
      };

      await ClassroomLog.findOneAndUpdate(
        { roomId },
        { $push: { events: endLog } }
      );

      io.to(roomId).emit("classEnded");
    });

    socket.on("disconnect", async () => {
      const user = await User.findOneAndDelete({ socketId: socket.id });
      if (!user) return;

      const leaveLog = {
        type: "leave",
        userRole: user.role,
        userName: user.name,
        timestamp: new Date(),
      };

      await ClassroomLog.findOneAndUpdate(
        { roomId: user.roomId },
        { $push: { events: leaveLog } }
      );

      const users = await User.find({ roomId: user.roomId });
      const isClassStarted = activeClasses.has(user.roomId);

      io.to(user.roomId).emit("updateClassroom", {
        students: users.filter((u) => u.role === "student").map((u) => u.name),
        teachers: users.filter((u) => u.role === "teacher").map((u) => u.name),
        isClassStarted,
      });
    });
  });
};

module.exports = handleSocket;
