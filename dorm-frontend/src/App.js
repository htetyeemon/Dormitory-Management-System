import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import StudentDashboard from './component/student/StudentDashboard';
import ManagerDashboard from './component/manager/ManagerDashboard';
import Login from './component/Login';
import ProtectedRoute from './component/ProtectedRoute';
import Layout from './component/Layout';
import RoomPage from './component/student/RoomPage';
import Announcements from './component/student/Announcements';
import ServicePage from './component/student/ServicePage';
import CheckInOutPage from './component/student/CheckInOutPage';
import ManagerRooms from './component/manager/ManagerRooms';
import ManagerAnnouncements from './component/manager/ManagerAnnouncements';
import CheckInOutManagement from './component/manager/CheckInOutManagement';
import ComplaintsPage from './component/manager/ComplaintsPage';
import './App.css';
import { AnnouncementsProvider } from './context/AnnouncementsContext';

function App() {
  return (
    <AuthProvider>
      <AnnouncementsProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Student Routes */}
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
            <Route path="/student/:studentId/checkinout" element={
              <ProtectedRoute>
                <Layout>
                  <CheckInOutPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Manager Routes */}
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
      </AnnouncementsProvider>
    </AuthProvider>
  );
}

export default App;