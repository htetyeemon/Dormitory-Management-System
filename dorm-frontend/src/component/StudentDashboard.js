import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../service/api';

const StudentDashboard = () => {
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
      const response = await studentAPI.getDashboard(user.id);
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
              Welcome back, {user.name}!
            </p>
            <p style={{
              color: '#64748b',
              fontSize: '1rem',
              fontWeight: 400,
              lineHeight: 'normal',
            }}>
              Here's what's happening in your dorm today.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          paddingTop: '1.5rem',
        }}>
          <div style={cardStyle}>
            <span style={{ color: '#1173d4', fontSize: '1.875rem' }}>🚪</span>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 400 }}>
                Room Number
              </p>
              <p style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>
                {dashboardData?.room?.roomNum || 'Not Assigned'}
              </p>
            </div>
          </div>
          
          <div style={cardStyle}>
            <span style={{ color: '#22c55e', fontSize: '1.875rem' }}>✅</span>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 400 }}>
                Check-in Status
              </p>
              <p style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>
                Active
              </p>
            </div>
          </div>
          
          <div style={cardStyle}>
            <span style={{ color: '#f97316', fontSize: '1.875rem' }}>🔧</span>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 400 }}>
                Maintenance Requests
              </p>
              <p style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>
                {dashboardData?.recentRequests?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.5rem',
          padding: '1rem',
          paddingTop: '2rem',
        }}>
          {/* Announcements */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={cardStyle}>
              <h3 style={{
                color: '#0f172a',
                fontSize: '1.375rem',
                fontWeight: 700,
                lineHeight: 1.25,
                letterSpacing: '-0.015em',
                marginBottom: '0.5rem',
              }}>
                Announcements
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {dashboardData?.announcements?.map((announcement, index) => (
                  <div key={announcement.id} style={{
                    borderTop: index > 0 ? '1px solid #e2e8f0' : 'none',
                    paddingTop: index > 0 ? '1.5rem' : '0',
                  }}>
                    <h4 style={{ fontWeight: 700, color: '#0f172a' }}>
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
                    No announcements available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div style={cardStyle}>
            <h2 style={{
              color: '#0f172a',
              fontSize: '1.375rem',
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: '-0.015em',
              marginBottom: '0.75rem',
            }}>
              Contact Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ color: '#64748b', marginTop: '0.125rem' }}>📞</span>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Phone</p>
                  <p style={{ fontWeight: 500, color: '#0f172a' }}>+1 (234) 567-890</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ color: '#64748b', marginTop: '0.125rem' }}>📧</span>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Email</p>
                  <p style={{ fontWeight: 500, color: '#0f172a' }}>manager@mfudorm.com</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ color: '#64748b', marginTop: '0.125rem' }}>📍</span>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Address</p>
                  <p style={{ fontWeight: 500, color: '#0f172a' }}>123 University Drive, MFU City</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;