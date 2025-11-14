import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAnnouncements } from '../context/AnnouncementsContext';
import { studentAPI } from '../service/api';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDoorOpen,
    faCircleCheck, faHourglassStart, faCircleXmark, faCircleQuestion,
    faScrewdriverWrench,
    faPhone, faEnvelope, faLocationDot,
    faTriangleExclamation, faBuilding,
    faMarker,
} from '@fortawesome/free-solid-svg-icons';

const StudentDashboard = () => {
    const { user } = useAuth();
    const { announcementsUpdateTrigger } = useAnnouncements();
    const [dashboardData, setDashboardData] = useState(null);
    const [checkInOutHistory, setCheckInOutHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { studentId } = useParams();
    const [expandedAnnouncements, setExpandedAnnouncements] = useState(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
        fetchCheckInOutHistory();
    }, [studentId, announcementsUpdateTrigger]); // Add announcementsUpdateTrigger as dependency

    // Add this useEffect to refresh data periodically for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            fetchDashboardData();
            fetchCheckInOutHistory();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, [studentId]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await studentAPI.getDashboard(user.id);
            setDashboardData(response.data);
        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error('Error fetching dashboard:', err);
        }
    };

    const fetchCheckInOutHistory = async () => {
        try {
            const response = await studentAPI.getCheckInOutHistory(user.id);
            // Ensure we have an array even if response.data is null/undefined
            setCheckInOutHistory(response.data || []);
        } catch (err) {
            console.error('Error fetching check-in/out history:', err);
            setCheckInOutHistory([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    // Navigation handlers
    const handleRoomNumberClick = () => {
        navigate(`/student/${studentId}/room`);
    };

    const handleCheckInOutStatusClick = () => {
        navigate(`/student/${studentId}/checkinout`);
    };

    const handleServiceRequestsClick = () => {
        navigate(`/student/${studentId}/services`);
    };

    // Determine check-in status based on latest activity
    const getCheckInStatus = () => {
        if (!checkInOutHistory || checkInOutHistory.length === 0) {
            return { status: 'Unknown', lastActivity: null };
        }

        // Sort activities by date (newest first)
        const sortedActivities = [...checkInOutHistory].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        const latestActivity = sortedActivities[0];

        // Enhanced status determination logic
        if (latestActivity.status === 'APPROVED') {
            return {
                status: 'Approved',
                lastActivity: latestActivity,
                type: latestActivity.type
            };
        } else if (latestActivity.status === 'PENDING') {
            return {
                status: 'Pending Approval',
                lastActivity: latestActivity,
                type: latestActivity.type
            };
        } else if (latestActivity.status === 'REJECTED') {
            return {
                status: 'Rejected',
                lastActivity: latestActivity,
                type: latestActivity.type
            };
        } else {
            return {
                status: 'Unknown',
                lastActivity: latestActivity,
                type: latestActivity.type
            };
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

    const clickableCardStyle = {
        ...cardStyle,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Checked In':
                return '#CD853F';
            case 'Checked Out':
                return '#CD853F';
            case 'Pending Approval':
                return '#CD853F';
            case 'Rejected':
                return '#CD853F';
            default:
                return '#CD853F';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            
            case 'Pending Approval':
                return <FontAwesomeIcon icon={faHourglassStart} />;
            case 'Rejected':
                return <FontAwesomeIcon icon={faCircleXmark} />;
            default:
                return <FontAwesomeIcon icon={faCircleCheck} />;
        }
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

    const checkInStatus = getCheckInStatus();

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
                        Welcome back, {user.name}!
                    </h1>
                    <p style={{
                        color: '#191919ff',
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
                    {/* Room Number Card - Clickable */}
                    <div 
                        style={{ 
                            ...cardStyle, 
                            padding: '1.5rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                        }}
                        onClick={handleRoomNumberClick}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <span style={{ color: '#CD853F', fontSize: '2rem' }}><FontAwesomeIcon icon={faDoorOpen} /></span>
                        <div>
                            <p style={{ color: '#191919ff', fontSize: '1rem', fontWeight: 400, margin: 0 }}>
                                Room Number
                            </p>
                            <p style={{ color: '#000000', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                                {dashboardData?.room?.roomNum || 'Not Assigned'}
                            </p>
                        </div>
                    </div>

                    {/* Check-in/out Status Card - Clickable */}
                    <div 
                        style={{ 
                            ...cardStyle, 
                            padding: '1.5rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                        }}
                        onClick={handleCheckInOutStatusClick}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <span style={{ color: getStatusColor(checkInStatus.status), fontSize: '2rem' }}>
                            {getStatusIcon(checkInStatus.status)}
                        </span>
                        <div>
                            <p style={{ color: '#191919ff', fontSize: '1rem', fontWeight: 400, margin: 0 }}>
                               {checkInStatus.type ? `${checkInStatus.type} status` : 'Status'}
                            </p>
                            <p style={{
                                color: '#000000',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                margin: 0
                            }}>
                                {checkInStatus.status}
                            </p>
                            {checkInStatus.lastActivity && (
                                <p style={{
                                    color: '#191919ff',
                                    fontSize: '0.75rem',
                                    margin: '0.25rem 0 0 0',
                                }}>
                                    Last: {new Date(checkInStatus.lastActivity.date).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Service Requests Card - Clickable */}
                    <div 
                        style={{ 
                            ...cardStyle, 
                            padding: '1.5rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                        }}
                        onClick={handleServiceRequestsClick}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <span style={{ color: '#CD853F', fontSize: '2rem' }}><FontAwesomeIcon icon={faScrewdriverWrench} /></span>
                        <div>
                            <p style={{ color: '#191919ff', fontSize: '1rem', fontWeight: 400, margin: 0 }}>
                                Service Requests
                            </p>
                            <p style={{ color: '#000000', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
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
                        padding: '1.5rem',
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
                            {dashboardData?.announcements?.map((announcement, index) => {
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
                            {(!dashboardData?.announcements || dashboardData.announcements.length === 0) && (
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
                            padding: '1.5rem',
                        }}>
                            <h3 style={{
                                color: '#000000',
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
                                    <span style={{ color: '#CD853F', fontSize: '1.5rem', marginTop: '0.125rem', paddingRight: '10px' }}><FontAwesomeIcon icon={faPhone} /></span>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Phone</p>
                                        <p style={{ fontWeight: 500, color: '#191919ff', margin: 0 }}>+1 (234) 567-890</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ color: '#CD853F', fontSize: '1.5rem', marginTop: '0.125rem', paddingRight: '10px' }}><FontAwesomeIcon icon={faEnvelope} /></span>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Email</p>
                                        <p style={{ fontWeight: 500, color: '#191919ff', margin: 0 }}>manager@mfudorm.com</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ color: '#CD853F', fontSize: '1.5rem', marginTop: '0.125rem', paddingRight: '10px' }}><FontAwesomeIcon icon={faLocationDot} /></span>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Address</p>
                                        <p style={{ fontWeight: 500, color: '#191919ff', margin: 0 }}>123 University Drive, MFU City</p>
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
                            padding: '1.5rem',
                        }}>
                            <h3 style={{
                                color: '#000000',
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
                                    <span style={{ color: '#CD853F', fontSize: '1.5rem', marginTop: '0.125rem', paddingRight: '10px' }}><FontAwesomeIcon icon={faTriangleExclamation} /></span>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Emergency Services</p>
                                        <p style={{ fontWeight: 500, color: '#191919ff', margin: 0 }}>24/7</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ color: '#CD853F', fontSize: '1.5rem', marginTop: '0.125rem', paddingRight: '10px' }}><FontAwesomeIcon icon={faScrewdriverWrench} /></span>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Maintenance & Repairs</p>
                                        <p style={{ fontWeight: 500, color: '#191919ff', margin: 0 }}>3:00AM-11:00PM</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <span style={{ color: '#CD853F', fontSize: '1.5rem', marginTop: '0.125rem', paddingRight: '10px' }}><FontAwesomeIcon icon={faBuilding} /></span>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Dormitory Office</p>
                                        <p style={{ fontWeight: 500, color: '#191919ff', margin: 0 }}>9:00AM-5:00PM</p>
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