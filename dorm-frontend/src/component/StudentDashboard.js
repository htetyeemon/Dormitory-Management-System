import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../service/api';
import { useParams } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { studentId } = useParams();
  const [expandedAnnouncements, setExpandedAnnouncements] = useState(new Set());

  useEffect(() => {
    fetchDashboardData();
  }, [studentId]);

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
    return description.length > 200;
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
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
    <div style={{ padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            color: '#0f172a',
            fontSize: '2.25rem',
            fontWeight: 900,
            lineHeight: 1.25,
            letterSpacing: '-0.033em',
            marginBottom: '0.5rem',
          }}>
            Welcome back, {user.name}!
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '1rem',
            fontWeight: 400,
          }}>
            Here's what's happening in your dorm today.
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
            <span style={{ color: '#1173d4', fontSize: '2rem', marginBottom: '0.5rem' }}>🚪</span>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 400, margin: 0 }}>
                Room Number
              </p>
              <p style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {dashboardData?.room?.roomNum || 'Not Assigned'}
              </p>
            </div>
          </div>
          
          <div style={cardStyle}>
            <span style={{ color: '#22c55e', fontSize: '2rem', marginBottom: '0.5rem' }}>✅</span>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 400, margin: 0 }}>
                Check-in Status
              </p>
              <p style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                Active
              </p>
            </div>
          </div>
          
          <div style={cardStyle}>
            <span style={{ color: '#f97316', fontSize: '2rem', marginBottom: '0.5rem' }}>🔧</span>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 400, margin: 0 }}>
                Maintenance Requests
              </p>
              <p style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {dashboardData?.recentRequests?.length || 0}
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
          {/* Announcements - Left Column */}
          <div style={{
            ...cardStyle,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h2 style={{
              color: '#0f172a',
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
            }}>
              Recent Announcements
            </h2>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              flex: 1,
            }}>
              {dashboardData?.announcements?.map((announcement, index) => {
                const isExpanded = expandedAnnouncements.has(announcement.id);
                const shouldShowReadMore = needsReadMore(announcement.description);

                return (
                  <div key={announcement.id} style={{
                    borderTop: index > 0 ? '1px solid #e2e8f0' : 'none',
                    paddingTop: index > 0 ? '1.5rem' : '0',
                  }}>
                    <h3 style={{ 
                      fontWeight: 700, 
                      color: '#0f172a',
                      fontSize: '1.1rem',
                      marginBottom: '0.5rem',
                    }}>
                      {announcement.title}
                    </h3>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: '#64748b', 
                      marginBottom: '0.5rem',
                    }}>
                      {new Date(announcement.dateTime).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#334155',
                      lineHeight: 1.5,
                    }}>
                      <div
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word',
                        }}
                      >
                        {announcement.description}
                      </div>
                      {shouldShowReadMore && (
                        <button
                          onClick={() => toggleReadMore(announcement.id)}
                          style={{
                            color: '#1173d4',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            marginTop: '0.5rem',
                            alignSelf: 'flex-start',
                          }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                          {isExpanded ? 'Read Less ↑' : 'Read More →'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {(!dashboardData?.announcements || dashboardData.announcements.length === 0) && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flex: 1,
                  color: '#64748b',
                }}>
                  No announcements available
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Contact Info and Service Hours */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem',
            height: '100%',
          }}>
            {/* Contact Information */}
            <div style={{
              ...cardStyle,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <h3 style={{
                color: '#0f172a',
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
              }}>
                Contact Information
              </h3>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.25rem',
                flex: 1,
                justifyContent: 'space-around',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.125rem' }}>📞</span>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>Phone</p>
                    <p style={{ fontWeight: 500, color: '#0f172a', margin: 0 }}>+1 (234) 567-890</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.125rem' }}>📧</span>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>Email</p>
                    <p style={{ fontWeight: 500, color: '#0f172a', margin: 0 }}>manager@mfudorm.com</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.125rem' }}>📍</span>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>Address</p>
                    <p style={{ fontWeight: 500, color: '#0f172a', margin: 0 }}>123 University Drive, MFU City</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Hours */}
            <div style={{
              ...cardStyle,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <h3 style={{
                color: '#0f172a',
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
              }}>
                Service Hours
              </h3>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.25rem',
                flex: 1,
                justifyContent: 'space-around',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.125rem' }}>🚨</span>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>Emergency Services</p>
                    <p style={{ fontWeight: 500, color: '#0f172a', margin: 0 }}>24/7</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.125rem' }}>🔧</span>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>Maintenance & Repairs</p>
                    <p style={{ fontWeight: 500, color: '#0f172a', margin: 0 }}>3:00AM-11:00PM</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.125rem' }}>🏢</span>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>Dormitory Office</p>
                    <p style={{ fontWeight: 500, color: '#0f172a', margin: 0 }}>9:00AM-5:00PM</p>
                  </div>
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