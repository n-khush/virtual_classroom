const User = require("../models/User");
const ClassroomLog = require("../models/ClassroomLog");
const activeClasses = new Map();

const handleSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle joining a room
    socket.on("joinRoom", async ({ room, name, role }) => {
      try {
        if (!room || !name || !role) {
          socket.emit("error", { message: "Invalid room or user data." });
          return;
        }

        const roomId = room;
        let classroomLog = await ClassroomLog.findOne({ roomName: room });

        // Create a new classroom log if it doesn't exist
        if (!classroomLog && role !== "student") {
          classroomLog = await ClassroomLog.create({
            roomId,
            roomName: room,
            events: [],
            createdAt: new Date(),
          });
        }

        // Upsert user information
        const user = await User.findOneAndUpdate(
          { name, roomId },
          { socketId: socket.id, role },
          { upsert: true, new: true }
        );

        // Check if the user is already logged in on another tab
        const existingUser = await User.findOne({ name, roomId, socketId: { $ne: socket.id } });
        if (existingUser && role === "teacher") {
          socket.emit("error", { message: "You are already logged in on another tab." });
          await User.findOneAndDelete({ socketId: socket.id }); // Remove duplicate login
          return;
        }

        socket.join(roomId);
        console.log(`${name} joined room: ${roomId}`);

        // Log user entry
        const entryLog = {
          type: "entry",
          userRole: role,
          userName: name,
          timestamp: new Date(),
        };
        await ClassroomLog.findOneAndUpdate({ roomId }, { $push: { events: entryLog } });

        // Fetch all users in the room
        const users = await User.find({ roomId });
        const isClassStarted = activeClasses.has(roomId);

        // Notify all clients in the room about the update
        io.to(roomId).emit("updateClassroom", {
          students: users.filter((u) => u.role === "student").map((u) => u.name),
          teachers: users.filter((u) => u.role === "teacher").map((u) => u.name),
          isClassStarted,
        });
      } catch (error) {
        console.error("Error in joinRoom:", error.message);
        socket.emit("error", { message: "An error occurred while joining the room." });
      }
    });

    // Handle starting a class
    socket.on("startClass", async ({ room, name }) => {
      try {
        const roomId = room;

        // Ensure only one teacher can start a class
        if (activeClasses.has(roomId)) {
          socket.emit("error", { message: "Class is already active." });
          return;
        }

        // Track the teacher who started the class
        activeClasses.set(roomId, { teacher: name, version: Date.now() });

        const startLog = {
          type: "start",
          teacher: name,
          version: activeClasses.get(roomId).version,
          timestamp: new Date(),
        };
        await ClassroomLog.findOneAndUpdate(
          { roomId },
          { $push: { events: startLog } }
        );

        const users = await User.find({ roomId });

        io.to(roomId).emit("updateClassroom", {
          isClassStarted: true,
          students: users.filter((u) => u.role === "student").map((u) => u.name),
          teachers: users.filter((u) => u.role === "teacher").map((u) => u.name),
          classVersion: activeClasses.get(roomId).version,
        });
      } catch (error) {
        console.error("Error in startClass:", error.message);
        socket.emit("error", { message: "Failed to start the class." });
      }
    });

    // Handle ending a class
    socket.on("endClass", async ({ room, name }) => {
      try {
        const roomId = room;

        const activeClass = activeClasses.get(roomId);
        if (!activeClass) {
          socket.emit("error", { message: "Class is not active." });
          return;
        }

        // Only the teacher who started the class can end it
        if (activeClass.teacher !== name) {
          socket.emit("error", { message: "Only the teacher who started the class can end it." });
          return;
        }

        activeClasses.delete(roomId);

        const endLog = {
          type: "end",
          version: activeClass.version,
          timestamp: new Date(),
        };
        await ClassroomLog.findOneAndUpdate(
          { roomId },
          { $push: { events: endLog } }
        );

        io.to(roomId).emit("classEnded", { version: activeClass.version });
      } catch (error) {
        console.error("Error in endClass:", error.message);
        socket.emit("error", { message: "Failed to end the class." });
      }
    });

    // Handle user disconnect
    socket.on("disconnect", async () => {
      try {
        const user = await User.findOneAndDelete({ socketId: socket.id });
        if (!user) return;

        const roomId = user.roomId;

        const leaveLog = {
          type: "leave",
          userRole: user.role,
          userName: user.name,
          timestamp: new Date(),
        };
        await ClassroomLog.findOneAndUpdate({ roomId }, { $push: { events: leaveLog } });

        const users = await User.find({ roomId });
        const activeClass = activeClasses.get(roomId);

        // If the disconnecting user is the teacher who started the class, end the class
        if (activeClass?.teacher === user.name) {
          io.to(roomId).emit("confirmEndClass", {
            message: "The teacher's session has ended. The class will end unless restarted soon.",
          });

          setTimeout(async () => {
            if (activeClasses.get(roomId)?.teacher === user.name) {
              activeClasses.delete(roomId);

              const endLog = {
                type: "forced-end",
                version: activeClass.version,
                timestamp: new Date(),
              };
              await ClassroomLog.findOneAndUpdate(
                { roomId },
                { $push: { events: endLog } }
              );

              io.to(roomId).emit("classEnded", { version: activeClass.version });
            }
          }, 30000); // Wait 30 seconds before ending
        }

        io.to(roomId).emit("updateClassroom", {
          students: users.filter((u) => u.role === "student").map((u) => u.name),
          teachers: users.filter((u) => u.role === "teacher").map((u) => u.name),
          isClassStarted: activeClasses.has(roomId),
        });
      } catch (error) {
        console.error("Error in disconnect:", error.message);
      }
    });
  });
};

module.exports = handleSocket;
