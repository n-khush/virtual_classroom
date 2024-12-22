import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

const Classroom = () => {
  const { state } = useLocation();
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

  useEffect(() => {
    if (!name || !role) {
      alert("Invalid access! Redirecting to room selection...");
      navigate("/");
      return;
    }
    socket.emit("joinRoom", { room, name, role });

    return () => socket.disconnect();
  }, [room, name, role, navigate]);

  useEffect(() => {
    const handleUpdateClassroom = (data) => {
      console.log(JSON.stringify(data),"------->")
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

    // return () => {
    //   socket.off("updateClassroom", handleUpdateClassroom);
    //   socket.off("classEnded", handleClassEnded);
    //   socket.off("error", handleError);
    // };
  }, [navigate, role, socket]);

  const handleStartClass = () => {
    socket.emit("startClass", { room });
  };

  const handleEndClass = () => {
    socket.emit("endClass", { room });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading classroom data...</div>;
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100 px-6">
      {/* Start/End Buttons */}
      {role === "teacher" && (
        <div className="absolute top-4 right-4">
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

      {/* Classroom Info */}
      <div className="absolute top-4 left-4 bg-white shadow-md rounded-lg p-4 w-64">
        <h1 className="text-lg font-bold mb-2">Classroom: {room}</h1>
        <p className="mb-1">
          <span className="font-medium">Role:</span> {role}
        </p>
        <p>
          <span className="font-medium">Name:</span> {name}
        </p>
      </div>

      {/* Teachers and Students Lists (Aligned Horizontally) */}
      <div className="flex flex-row gap-6 mt-[15rem] px-4 justify-center">
        {/* Teachers List */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-bold mb-4">Teachers</h2>
          <ul className="space-y-2">
            {classroomData.teachers?.length > 0 ? (
              classroomData.teachers.map((teacher) => (
                <li key={teacher} className="text-gray-700">
                  {teacher}
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">No teachers are present yet.</p>
            )}
          </ul>
        </div>

        {/* Students List */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-bold mb-4">Students</h2>
          <ul className="space-y-2">
            {classroomData.students?.length > 0 ? (
              classroomData.students.map((student) => (
                <li key={student} className="text-gray-700">
                  {student}
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">No students are present yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Classroom;
