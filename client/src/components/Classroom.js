import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

const Classroom = () => {
  const { state } = useLocation(); // Get state (name, role) passed during navigation
  const { room } = useParams();
  const [name, setName] = useState(state?.name || "");
  const [role, setRole] = useState(state?.role || "");
  const [classroomData, setClassroomData] = useState({
    students: [],
    teachers: [],
    isClassStarted: false,
  }); // Ensure default structure
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const socket = io(process.env.REACT_APP_SOCKET_URL);

  useEffect(() => {
    if (!name || !role) {
      alert("Invalid access! Redirecting to room selection...");
      navigate("/"); // Redirect to the room selection page
      return;
    }
    console.log("this is line 25")

    // Emit 'joinRoom' event when the component is mounted
    socket.emit("joinRoom", { room, name, role });
// debugger;
    // Listen for updates on classroom data
    socket.on("updateClassroom", (data) => {
      console.log("update emitted",data)
      setClassroomData(data || { students: [], teachers: [], isClassStarted: false });
      setIsLoading(false);

      // Redirect if the class hasn't started and the user is a student
      if (!data?.isClassStarted && role === "student") {
        alert("Class has not started yet! Redirecting to room selection...");
        navigate("/"); // Redirect student back to room selection
      }
    });

    // Listen for 'classEnded' event when the class ends
    socket.on("classEnded", () => {
      alert("Class has ended! Redirecting to room selection...");
      debugger;
      navigate("/"); // Redirect to room selection if class ends
    });

    // Handle errors from the backend
    socket.on("error", (error) => {
      alert(error.message);
    });

    return () => {
      socket.disconnect(); // Disconnect from the socket when the component unmounts
    };
  }, [room, name, role, socket, navigate]);

  // Handle the event to start the class
  const handleStartClass = () => {
    console.log("emitted start")  
    socket.emit("startClass", { room });
  };

  // Handle the event to end the class
  const handleEndClass = () => {
    socket.emit("endClass", { room });
  };

  if (isLoading) {
    return <div>Loading classroom data 21...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Classroom: {room}</h1>
      <p className="mb-4">Role: {role}</p>
      <p className="mb-4">Name: {name}</p>

      <div className="mb-4">
        <h2 className="text-lg font-bold">Teachers:</h2>
        <ul>
          {classroomData.teachers?.length > 0 ? (
            classroomData.teachers.map((teacher) => <li key={teacher}>{teacher}</li>)
          ) : (
            <p>No teachers are present yet.</p>
          )}
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold">Students:</h2>
        <ul>
          {classroomData.students?.length > 0 ? (
            classroomData.students.map((student) => <li key={student}>{student}</li>)
          ) : (
            <p>No students are present yet.</p>
          )}
        </ul>
      </div>

      {/* Teacher-specific controls */}
      {role === "teacher" && (
        <div>
          {!classroomData.isClassStarted ? (
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
              onClick={handleStartClass}
            >
              Start Class
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={handleEndClass}
            >
              End Class
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Classroom;
