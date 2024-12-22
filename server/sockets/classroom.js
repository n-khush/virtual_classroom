const User = require("../models/User");
const ClassroomLog = require("../models/ClassroomLog");
const activeClasses = new Map();

const handleSocket = (io)=>{
 io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle joinRoom event
  socket.on("joinRoom", async ({ room, name, role }) => {
    if (!name || !role || !room) {
      socket.emit("error", { message: "Invalid room or user data." });
      return;
    }

    // Add user to the database
    const user = await User.findOneAndUpdate(
      { name, roomId: room },
      { socketId: socket.id, role },
      { upsert: true, new: true }
    );

    // Join the room
    socket.join(room);
    console.log(`${name} joined room: ${room}`);

    // Log the entry
    const entryLog = {
      type: "entry",
      userRole: role,
      userName: name,
      timestamp: new Date(),
    };

    await ClassroomLog.findOneAndUpdate(
      { roomId: room },
      { $push: { events: entryLog } },
      { upsert: true, new: true }
    );

    // Notify all clients in the room
    const users = await User.find({ roomId: room });
    const isClassStarted = activeClasses.has(room);
    console.log("here...");
    io.to(room).emit("updateClassroom", {
      students: users.filter((u) => u.role === "student").map((u) => u.name),
      teachers: users.filter((u) => u.role === "teacher").map((u) => u.name),
      isClassStarted,
    });

    console.log(`${name} (${role}) joined room: ${room}`);
  });

  // Handle startClass event
  socket.on("startClass", async ({ room }) => {
    if (activeClasses.has(room)) {
      socket.emit("error", { message: "Class is already active." });
      return;
    }

    activeClasses.set(room, true);

    const startLog = {
      type: "start",
      timestamp: new Date(),
    };

    await ClassroomLog.findOneAndUpdate(
      { roomId: room },
      { $push: { events: startLog } },
      { upsert: true, new: true }
    );

    io.to(room).emit("updateClassroom", { isClassStarted: true });
    console.log(`Class started in room: ${room}`);
  });

  // Handle endClass event
  socket.on("endClass", async ({ room }) => {
    if (!activeClasses.has(room)) {
      socket.emit("error", { message: "Class is not active." });
      return;
    }

    activeClasses.delete(room);

    const endLog = {
      type: "end",
      timestamp: new Date(),
    };

    await ClassroomLog.findOneAndUpdate(
      { roomId: room },
      { $push: { events: endLog } },
      { upsert: true, new: true }
    );

    io.to(room).emit("classEnded");
    console.log(`Class ended in room: ${room}`);
  });

  // Handle disconnect event
  socket.on("disconnect", async () => {
    const user = await User.findOneAndDelete({ socketId: socket.id });
    if (!user) return;

    console.log(`${user.name} (${user.role}) left room: ${user.roomId}`);

    const leaveLog = {
      type: "leave",
      userRole: user.role,
      userName: user.name,
      timestamp: new Date(),
    };

    await ClassroomLog.findOneAndUpdate(
      { roomId: user.roomId },
      { $push: { events: leaveLog } },
      { upsert: true, new: true }
    );

    const users = await User.find({ roomId: user.roomId });
    const isClassStarted = activeClasses.has(user.roomId);

    io.to(user.roomId).emit("updateClassroom", {
      students: users.filter((u) => u.role === "student").map((u) => u.name),
      teachers: users.filter((u) => u.role === "teacher").map((u) => u.name),
      isClassStarted,
    });
  });
})
}
module.exports = handleSocket