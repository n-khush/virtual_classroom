import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ClassroomHistory = () => {
  const { roomId } = useParams()
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassroomLogs = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/reports/${roomId}`);
        setLogs(response.data);
        setLoading(false);
      } catch (err) {
        console.log(err)
        setError('Error fetching classroom logs');
        setLoading(false);
      }
    };
    fetchClassroomLogs();

  }, [roomId]);

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
    </div>
  );
};

export default ClassroomHistory;
