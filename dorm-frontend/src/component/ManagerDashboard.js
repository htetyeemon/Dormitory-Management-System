import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { managerAPI } from '../service/api';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#fff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '16rem' }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          borderRadius: '9999px',
          height: '3rem',
          width: '3rem',
          border: '2px solid #1173d4',
          borderTopColor: 'transparent',
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '16rem' }}>
        <div style={{ color: '#ef4444' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '0 1rem',
      display: 'flex',
      justifyContent: 'center',
      paddingTop: '1.25rem',
      paddingBottom: '1.25rem',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '1024px',
        flex: 1,
      }}>
        {/* Welcome Section */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1rem',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <p style={{
              color: '#0f172a',
              fontSize: '2.25rem',
              fontWeight: 900,
              lineHeight: 1.25,
              letterSpacing: '-0.033em',
            }}>
              Manager Dashboard
            </p>
            <p style={{
              color: '#64748b',
              fontSize: '1rem',
              fontWeight: 400,
              lineHeight: 'normal',
            }}>
              Welcome back, {user.name}. Here's your dormitory overview.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          paddingTop: '1.5rem',
        }}>
          <div style={cardStyle}>
            <span style={{ color: '#3b82f6', fontSize: '1.875rem' }}>👥</span>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 400 }}>
                Total Students
              </p>
              <p style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>
                {dashboardData?.totalStudents || 0}
              </p>
            </div>
          </div>
          
          <div style={cardStyle}>
            <span style={{ color: '#22c55e', fontSize: '1.875rem' }}>🚪</span>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 400 }}>
                Available Rooms
              </p>
              <p style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>
                {dashboardData?.availableRooms || 0}
              </p>
            </div>
          </div>
          
          <div style={cardStyle}>
            <span style={{ color: '#f97316', fontSize: '1.875rem' }}>⏰</span>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 400 }}>
                Pending Check-ins
              </p>
              <p style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>
                {dashboardData?.pendingCheckIns || 0}
              </p>
            </div>
          </div>
          
          <div style={cardStyle}>
            <span style={{ color: '#ef4444', fontSize: '1.875rem' }}>⚠️</span>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 400 }}>
                Active Complaints
              </p>
              <p style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>
                {dashboardData?.activeComplaints || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Announcements */}
        <div style={{ padding: '1rem', paddingTop: '2rem' }}>
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
              ))}
              {(!dashboardData?.announcements || dashboardData.announcements.length === 0) && (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>
                  No recent announcements
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;