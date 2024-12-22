// src/components/ClassroomHistory.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate hook

const ClassroomHistory = () => {
  const { roomId } = useParams(); // Get the roomId from the URL
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Use useNavigate hook to navigate programmatically

  useEffect(() => {
    const fetchClassroomLogs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/${roomId}`);
        setLogs(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching classroom logs');
        setLoading(false);
      }
    };

    fetchClassroomLogs();
  }, [roomId]); // Fetch logs when roomId changes

  const renderEventDetails = (event) => {
    return (
      <div key={event._id} className="border-b p-2">
        <strong>Event Type:</strong> {event.type}
        <br />
        <strong>User Name:</strong> {event.userName}
        <br />
        <strong>User Role:</strong> {event.userRole || 'Unknown'}
        <br />
        <strong>Timestamp:</strong> {new Date(event.timestamp).toLocaleString()}
      </div>
    );
  };

  const handleGoHome = () => {
    navigate('/'); // Navigate to the home screen
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Classroom History for Room: {roomId}</h2>
      
      {loading ? (
        <p>Loading logs...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        logs.map((log) => (
          <div key={log._id} className="mb-6">
            <h3 className="text-lg font-semibold">Room: {log.roomName}</h3>
            <p className="text-gray-500">Created at: {new Date(log.createdAt).toLocaleString()}</p>
            <div className="mt-4">
              {log.events.map(renderEventDetails)}
            </div>
          </div>
        ))
      )}

      <button
        onClick={handleGoHome}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Go to Home Screen
      </button>
    </div>
  );
};

export default ClassroomHistory;
