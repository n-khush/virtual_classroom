import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomSelection from "./components/RoomSelection";
import Classroom from "./components/Classroom";
import ClassroomHistory from './components/ClassroomHistory'; // Adjust path based on where you place it
import NotFound from "./components/NotFound"; // Assuming you put the NotFound component in 'components'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoomSelection />} />
        <Route path="/classroom/:room" element={<Classroom />} />
        <Route path="/history/:roomId" element={<ClassroomHistory />} />
        <Route path="*" element={<NotFound />} />  {/* Catch-all route for invalid URLs */}
      </Routes>
    </Router>
  );
}

export default App;
