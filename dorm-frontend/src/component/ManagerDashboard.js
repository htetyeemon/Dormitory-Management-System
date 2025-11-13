import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { managerAPI } from '../service/api';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPeopleLine,
  faWindowRestore,
  faAlarmClock,
  faTriangleExclamation,
  faUserPlus,
  faEye,
  faCheckToSlot,
  faBullhorn
} from '@fortawesome/free-solid-svg-icons';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { managerId } = useParams();
  const [expandedAnnouncements, setExpandedAnnouncements] = useState(new Set());
  const [pendingCheckIns, setPendingCheckIns] = useState(0);
  const [activeComplaints, setActiveComplaints] = useState(0);

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
    justifyContent: 'left',
    gap: '0.75rem',
    width: '100%',
    cursor: 'pointer',
    overflow: 'hidden',
    borderRadius: '0.5rem',
    height: '3.5rem',
    padding: '0 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 'normal',
    border: '1px solid #e8c8b5ff',
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
          <div style={{ ...cardStyle, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#CD853F', fontSize: '2rem' }}><FontAwesomeIcon icon={faPeopleLine} /></span>
            <div>
              <p style={{ color: '#191919ff', fontSize: '1rem', fontWeight: 400, margin: 0 }}>
                Total Students
              </p>
              <p style={{ color: '#69301cff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {dashboardData?.totalStudents || 0}
              </p>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#CD853F', fontSize: '2rem' }}><FontAwesomeIcon icon={faWindowRestore} /></span>
            <div>
              <p style={{ color: '#191919ff', fontSize: '1rem', fontWeight: 400, margin: 0 }}>
                Available Rooms
              </p>
              <p style={{ color: '#69301cff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {dashboardData?.availableRooms || 0}
              </p>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#CD853F', fontSize: '2rem' }}><FontAwesomeIcon icon={faAlarmClock} /></span>
            <div>
              <p style={{ color: '#191919ff', fontSize: '1rem', fontWeight: 400, margin: 0 }}>
                Pending Check-ins
              </p>
              <p style={{ color: '#69301cff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {pendingCheckIns}
              </p>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#CD853F', fontSize: '2rem' }}><FontAwesomeIcon icon={faTriangleExclamation} /></span>
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
          {/* Announcements - Left Column */}
          <div style={{
            ...cardStyle,
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            minHeight: '400px',
          }}>
            <h2 style={{
              color: '#000000',
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
              {recentAnnouncements.map((announcement, index) => {
                const isExpanded = expandedAnnouncements.has(announcement.id);
                const shouldShowReadMore = needsReadMore(announcement.description);
                return (
                  <div key={announcement.id} style={{
                    borderTop: index > 0 ? '1px solid #e2d6cf' : 'none',
                    paddingTop: index > 0 ? '1.5rem' : '0',
                  }}>
                    <h3 style={{
                      fontWeight: 700,
                      color: '#000000',
                      fontSize: '1.1rem',
                      marginBottom: '0.5rem',
                    }}>
                      {announcement.title}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#928d8dff',
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
                      color: '#191919ff',
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
                            color: '#806e6eff',
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
                          {isExpanded ? 'Read Less ↑' : 'Read More ↓'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {recentAnnouncements.length === 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  color: '#191919ff',
                }}>
                  No announcements available
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            height: '100%',
          }}>
            <div style={{
              ...cardStyle,
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
              minHeight: '400px',
            }}>
              <h3 style={{
                color: '#000000',
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
              }}>
                Quick Actions
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                flex: 1,
                justifyContent: 'space-around',
              }}>
                <button
                  style={buttonStyle}
                  onClick={handleAssignRoom}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5ebe6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <span style={{ color: '#CD853F', fontSize: '1.2rem' }}>
                    <FontAwesomeIcon icon={faUserPlus} />
                  </span>
                  <span>Assign Room</span>
                </button>

                <button
                  style={buttonStyle}
                  onClick={handleViewComplaints}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5ebe6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <span style={{ color: '#CD853F', fontSize: '1.2rem' }}>
                    <FontAwesomeIcon icon={faEye} />
                  </span>
                  <span>View Complaints</span>
                </button>

                <button
                  style={buttonStyle}
                  onClick={handleCreateAnnouncement}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5ebe6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <span style={{ color: '#CD853F', fontSize: '1.2rem' }}>
                    <FontAwesomeIcon icon={faBullhorn} />
                  </span>
                  <span>Create Announcement</span>
                </button>

                <button
                  style={buttonStyle}
                  onClick={handleCheckRequests}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5ebe6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <span style={{ color: '#CD853F', fontSize: '1.2rem' }}>
                    <FontAwesomeIcon icon={faCheckToSlot} />
                  </span>
                  <span>Check Requests</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;