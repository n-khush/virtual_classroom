import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RoomSelection = () => {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!room || !name || !role) {
      alert("Please fill out all fields.");
      return;
    }

    navigate(`/classroom/${room}`, { state: { name, role } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Join or Create a Classroom</h1>
      <input
        type="text"
        placeholder="Room Name"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        className="mb-2 p-2 border border-gray-300 rounded"
      />
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-2 p-2 border border-gray-300 rounded"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded"
      >
        <option value="">Select Role</option>
        <option value="teacher">Teacher</option>
        <option value="student">Student</option>
      </select>
      <button
        onClick={handleJoin}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Join or Create Classroom
      </button>
    </div>
  );
};

export default RoomSelection;
