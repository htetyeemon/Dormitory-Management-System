import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import StudentDashboard from './component/StudentDashboard';
import ManagerDashboard from './component/ManagerDashboard';
import Login from './component/Login';
import ProtectedRoute from './component/ProtectedRoute';
import Layout from './component/Layout';
import RoomPage from './component/RoomPage';
import Announcements from './component/Announcements';
import ServicePage from './component/ServicePage';
import CheckInOutPage from './component/CheckInOutPage';
import ManagerRooms from './component/ManagerRooms';
import ManagerAnnouncements from './component/ManagerAnnouncements';
import CheckInOutManagement from './component/CheckInOutManagement';
import ComplaintsPage from './component/ComplaintsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student/:studentId/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/student/:studentId/room" element={
            <ProtectedRoute>
              <Layout>
                <RoomPage />
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
          <Route path="/student/:studentId/announcements" element={
          <ProtectedRoute>
            <Layout>
              <Announcements />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/student/:studentId/services" element={
          <ProtectedRoute>
            <Layout>
              <ServicePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/student/:studentId/checkin" element={
          <ProtectedRoute>
            <Layout>
              <CheckInOutPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/manager/:managerId/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <ManagerDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/manager/:managerId/rooms" element={
          <ProtectedRoute>
            <Layout>
              <ManagerRooms />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/manager/:managerId/announcements" element={
          <ProtectedRoute>
            <Layout>
              <ManagerAnnouncements />
            </Layout>
          </ProtectedRoute>
        } />
        // Add this route to your App.js
      <Route path="/manager/:managerId/checkinout" element={
        <ProtectedRoute>
          <Layout>
            <CheckInOutManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/manager/:managerId/complaints" element={
        <ProtectedRoute>
          <Layout>
            <ComplaintsPage />
          </Layout>
        </ProtectedRoute>
      } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;