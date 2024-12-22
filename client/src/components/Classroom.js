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
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const socket = io(process.env.REACT_APP_SOCKET_URL);

  // Emit joinRoom event on initial load
  useEffect(() => {
    if (!name || !role) {
      alert("Invalid access! Redirecting to room selection...");
      navigate("/");
      return;
    }
    socket.emit("joinRoom", { room, name, role });

    // Cleanup
    return () => socket.disconnect();
  }, [room, name, role, navigate]);

  // Handle socket events for classroom updates
  useEffect(() => {
    const handleUpdateClassroom = (data) => {
      setClassroomData(data || { students: [], teachers: [], isClassStarted: false });
      setIsLoading(false);

      if (!data?.isClassStarted && role === "student") {
        alert("Class has not started yet! Redirecting...");
        navigate("/");
      }
    };

    const handleClassEnded = () => {
      alert("Class has ended! Redirecting...");
      navigate("/");
    };

    const handleError = (error) => {
      alert(error.message);
    };

    socket.on("updateClassroom", handleUpdateClassroom);
    socket.on("classEnded", handleClassEnded);
    socket.on("error", handleError);

    // Cleanup
    // return () => {
    //   socket.off("updateClassroom", handleUpdateClassroom);
    //   socket.off("classEnded", handleClassEnded);
    //   socket.off("error", handleError);
    // };
  }, [navigate, role, socket,name]);

  // Handle class start/end actions
  const handleStartClass = () => {
    socket.emit("startClass", { room });
  };

  const handleEndClass = () => {
    socket.emit("endClass", { room });
  };

  if (isLoading) {
    return <div>Loading classroom data...</div>;
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
            classroomData.teachers.map((teacher) => (
              <li key={teacher}>{teacher}</li>
            ))
          ) : (
            <p>No teachers are present yet.</p>
          )}
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold">Students:</h2>
        <ul>
          {classroomData.students?.length > 0 ? (
            classroomData.students.map((student) => (
              <li key={student}>{student}</li>
            ))
          ) : (
            <p>No students are present yet.</p>
          )}
        </ul>
      </div>
          {console.log(role,classroomData,"{{{{{{{{{")}
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
