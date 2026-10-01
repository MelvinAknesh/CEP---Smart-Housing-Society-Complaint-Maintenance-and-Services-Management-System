import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import ScrollPage from './ScrollPage';
import ResidentPage from './ResidentPage';
import WorkerPage from './WorkerPage';
import CustomCursor from './CustomCursor';

function App() {
  return (
    <Router>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/app" element={<ScrollPage />} />
        <Route path="/resident" element={<ResidentPage />} />
        <Route path="/worker" element={<WorkerPage />} />
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
        <Route path="/complaints" element={<Navigate to="/app" replace />} />
        <Route path="/services" element={<Navigate to="/app" replace />} />
        <Route path="/bills" element={<Navigate to="/app" replace />} />
        <Route path="/members" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
