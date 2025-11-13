import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { managerAPI } from '../service/api';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { managerId } = useParams();

  useEffect(() => {
    fetchDashboardData();
    fetchPendingCheckInsForDorm();
    fetchPendingComplaintsForDorm();
  }, [managerId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getDashboard(user.id);
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCheckInsForDorm = async () => {
    try {
      const response = await managerAPI.getAllCheckInOutRequests(user.id);
      if (response.data && Array.isArray(response.data)) {
        const pendingRequests = response.data.filter(request => 
          request.status === 'PENDING'
        );
        setPendingCheckIns(pendingRequests.length);
      } else {
        setPendingCheckIns(0);
      }
    } catch (err) {
      console.error('Error fetching check-in/out requests:', err);
      setPendingCheckIns(0);
    }
  };

  const fetchPendingComplaintsForDorm = async () => {
    try {
      const response = await managerAPI.getAllComplaints(user.id);
      if (response.data && Array.isArray(response.data)) {
        const pendingComplaints = response.data.filter(complaint => 
          complaint.status === 'PENDING'
        );
        setActiveComplaints(pendingComplaints.length);
      } else {
        setActiveComplaints(0);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setActiveComplaints(0);
    }
  };

  const toggleReadMore = (announcementId) => {
    const newExpanded = new Set(expandedAnnouncements);
    if (newExpanded.has(announcementId)) {
      newExpanded.delete(announcementId);
    } else {
      newExpanded.add(announcementId);
    }
    setExpandedAnnouncements(newExpanded);
  };

  const needsReadMore = (description) => {
    return description && description.length > 200;
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e8c8b5ff'
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    cursor: 'pointer',
    overflow: 'hidden',
    borderRadius: '0.5rem',
    height: '3.5rem',
    padding: '0 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 'normal',
    border: 'none',
    transition: 'all 0.2s ease-in-out',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4F46E5',
    color: 'white',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'white',
    color: '#374151',
    transition: 'all 0.03s ease-in-out',
  };

  const handleAssignRoom = () => {
    navigate(`/manager/${user.id}/rooms`);
  };

  const handleViewComplaints = () => {
    navigate(`/manager/${user.id}/complaints`);
  };

  const handleCreateAnnouncement = () => {
    navigate(`/manager/${user.id}/announcements`, { 
      state: { openCreateModal: true } 
    });
  };

  const handleCheckRequests = () => {
    navigate(`/manager/${user.id}/checkinout`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '16rem' }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          borderRadius: '9999px',
          height: '3rem',
          width: '3rem',
          border: '2px solid #8d6e63',
          borderTopColor: 'transparent',
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '16rem' }}>
        <div style={{ color: '#d84315' }}>{error}</div>
      </div>
    );
  }

  const recentAnnouncements = dashboardData?.announcements?.slice(0, 3) || [];

  return (
    <div style={{ padding: '2rem', backgroundColor: '#faf7f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            color: '#000000',
            fontSize: '2.25rem',
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: '-0.033em',
            marginBottom: '0.5rem',
          }}>
            Manager Dashboard
          </h1>
          <p style={{
            color: '#191919ff',
            fontSize: '1rem',
            fontWeight: 400,
          }}>
            Welcome back, {user.name}. Here's your dormitory overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={cardStyle}>
            <span style={{ color: '#3b82f6', fontSize: '1.875rem' }}>👥</span>
            <div>
              <p style={{ color: '#191919ff', fontSize: '1rem', fontWeight: 400, margin: 0 }}>
                Total Students
              </p>
              <p style={{ color: '#69301cff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {dashboardData?.totalStudents || 0}
              </p>
            </div>
          </div>
          
          <div style={cardStyle}>
            <span style={{ color: '#22c55e', fontSize: '1.875rem' }}>🚪</span>
            <div>
              <p style={{ color: '#191919ff', fontSize: '1rem', fontWeight: 400, margin: 0 }}>
                Available Rooms
              </p>
              <p style={{ color: '#69301cff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {dashboardData?.availableRooms || 0}
              </p>
            </div>
          </div>
          
          <div style={cardStyle}>
            <span style={{ color: '#f97316', fontSize: '1.875rem' }}>⏰</span>
            <div>
              <p style={{ color: '#191919ff', fontSize: '1rem', fontWeight: 400, margin: 0 }}>
                Pending Check-ins
              </p>
              <p style={{ color: '#69301cff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {pendingCheckIns}
              </p>
            </div>
          </div>
          
          <div style={cardStyle}>
            <span style={{ color: '#ef4444', fontSize: '1.875rem' }}>⚠️</span>
            <div>
              <p style={{ color: '#191919ff', fontSize: '1rem', fontWeight: 400, margin: 0 }}>
                Active Complaints
              </p>
              <p style={{ color: '#69301cff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {activeComplaints}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem',
          alignItems: 'stretch',
        }}>
          {/* Left Column - Recent Announcements */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: '#0f172a', fontSize: '1.375rem', fontWeight: 700 }}>
                Recent Announcements
              </h3>
              <span style={{ color: '#1173d4', fontSize: '1.5rem' }}>📢</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dashboardData?.announcements?.map((announcement) => (
                <div key={announcement.id} style={{
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '1rem',
                }}>
                  <h4 style={{ fontWeight: 600, color: '#0f172a' }}>
                    {announcement.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {new Date(announcement.dateTime).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#334155', marginTop: '0.5rem' }}>
                    {announcement.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              style={primaryButtonStyle}
              onClick={handleAssignRoom}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4338CA'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4F46E5'}
            >
              <span style={{ fontSize: '1.25rem' }}>➕</span>
              <span>Assign Room</span>
            </button>
            
            <button
              style={secondaryButtonStyle}
              onClick={handleViewComplaints}
              onMouseEnter={(e) => e.target.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.target.backgroundColor = 'white'}
            >
              <span style={{ fontSize: '1.25rem' }}>👁️</span>
              <span>View Complaints</span>
            </button>
            
            <button
              style={secondaryButtonStyle}
              onClick={handleCreateAnnouncement}
              onMouseEnter={(e) => e.target.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.target.backgroundColor = 'white'}
            >
              <span style={{ fontSize: '1.25rem' }}>📢</span>
              <span>Create Announcement</span>
            </button>
            
            <button
              style={secondaryButtonStyle}
              onClick={handleCheckRequests}
              onMouseEnter={(e) => e.target.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.target.backgroundColor = 'white'}
            >
              <span style={{ fontSize: '1.25rem' }}>📋</span>
              <span>Check Requests</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;