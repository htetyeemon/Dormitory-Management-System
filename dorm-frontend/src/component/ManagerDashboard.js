import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAnnouncements } from '../context/AnnouncementsContext';
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
  faBullhorn,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const { announcementsUpdateTrigger } = useAnnouncements();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { managerId } = useParams();
  const [expandedAnnouncements, setExpandedAnnouncements] = useState(new Set());
  const [pendingCheckIns, setPendingCheckIns] = useState(0);
  const [activeComplaints, setActiveComplaints] = useState(0);
  const [expiringRequestsCount, setExpiringRequestsCount] = useState(0); // New state for expiring requests

  useEffect(() => {
    fetchDashboardData();
    fetchPendingCheckInsForDorm();
    fetchPendingComplaintsForDorm();
  }, [managerId, announcementsUpdateTrigger]);

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
        
        // Calculate expiring requests (within 24 hours)
        const now = new Date();
        const expiringRequests = pendingRequests.filter(request => {
          if (!request.date) return false;
          
          const requestDate = new Date(request.date);
          const timeDiff = requestDate.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          // Requests that are within 24 hours from now
          return hoursDiff <= 24 && hoursDiff >= 0;
        });
        
        setExpiringRequestsCount(expiringRequests.length);
      } else {
        setPendingCheckIns(0);
        setExpiringRequestsCount(0);
      }
    } catch (err) {
      console.error('Error fetching check-in/out requests:', err);
      setPendingCheckIns(0);
      setExpiringRequestsCount(0);
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

  // Navigation handlers for stat cards
  const handleAvailableRoomsClick = () => {
    navigate(`/manager/${user.id}/rooms`, { 
      state: { 
        initialFilter: 'available'
      } 
    });
  };

  const handlePendingCheckInsClick = () => {
    navigate(`/manager/${user.id}/checkinout`);
  };

  const handleActiveComplaintsClick = () => {
    navigate(`/manager/${user.id}/complaints`);
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e8c8b5ff',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  };

  const statCardHoverStyle = {
    backgroundColor: '#f9f5f3',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
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

        {/* Expiring Requests Warning Banner */}
        {expiringRequestsCount > 0 && (
          <div style={{
            backgroundColor: '#fef3f2',
            border: '1px solid #fecaca',
            borderRadius: '0.75rem',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <FontAwesomeIcon 
              icon={faExclamationTriangle} 
              style={{ 
                color: '#dc2626',
                fontSize: '1.25rem'
              }} 
            />
            <div>
              <p style={{
                color: '#dc2626',
                fontSize: '0.875rem',
                fontWeight: 600,
                margin: 0,
                marginBottom: '0.25rem'
              }}>
                Urgent Action Required
              </p>
              <p style={{
                color: '#991b1b',
                fontSize: '0.875rem',
                margin: 0
              }}>
                {expiringRequestsCount} pending check-in/out request{expiringRequestsCount !== 1 ? 's' : ''} {expiringRequestsCount === 1 ? 'is' : 'are'} about to expire within 24 hours. Please review them promptly.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {/* Total Students Card (Not clickable) */}
          <div style={{ ...cardStyle, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'default' }}>
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

          {/* Available Rooms Card (Clickable) */}
          <div 
            style={{ ...cardStyle, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
            onClick={handleAvailableRoomsClick}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, statCardHoverStyle)}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
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

          {/* Pending Check-ins Card (Clickable) */}
          <div 
            style={{ 
              ...cardStyle, 
              padding: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              position: 'relative'
            }}
            onClick={handlePendingCheckInsClick}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, statCardHoverStyle)}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Warning badge for expiring requests */}
            {expiringRequestsCount > 0 && (
              <div style={{
                position: 'absolute',
                top: '-0.5rem',
                right: '-0.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '50%',
                width: '1.5rem',
                height: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                {expiringRequestsCount}
              </div>
            )}
            <span style={{ color: '#CD853F', fontSize: '2rem' }}><FontAwesomeIcon icon={faAlarmClock} /></span>
            <div>
              <p style={{ color: '#191919ff', fontSize: '1rem', fontWeight: 400, margin: 0 }}>
                Pending Check-ins
              </p>
              <p style={{ color: '#69301cff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {pendingCheckIns}
              </p>
              {expiringRequestsCount > 0 && (
                <p style={{
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  margin: '0.25rem 0 0 0'
                }}>
                  {expiringRequestsCount} expiring soon!
                </p>
              )}
            </div>
          </div>

          {/* Active Complaints Card (Clickable) */}
          <div 
            style={{ ...cardStyle, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
            onClick={handleActiveComplaintsClick}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, statCardHoverStyle)}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
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

        {/* Rest of your component remains exactly the same */}
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
            cursor: 'default',
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
                          {isExpanded ? 'Read Less ?' : 'Read More ?'}
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
              cursor: 'default',
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