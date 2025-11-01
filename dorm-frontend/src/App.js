import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import StudentDashboard from './component/StudentDashboard';
import ManagerDashboard from './component/ManagerDashboard';
import Login from './component/Login';
import ProtectedRoute from './component/ProtectedRoute';
import Layout from './component/Layout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student" element={
            <ProtectedRoute>
              <Layout>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/manager" element={
            <ProtectedRoute>
              <Layout>
                <ManagerDashboard />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;