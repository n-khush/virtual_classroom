import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomSelection from "./components/RoomSelection";
import Classroom from "./components/Classroom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoomSelection />} />
        <Route path="/classroom/:room" element={<Classroom />} />
      </Routes>
    </Router>
  );
}

export default App;
