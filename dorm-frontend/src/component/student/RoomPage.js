// src/component/RoomPage.js
import React, { useEffect, useState } from "react";
import { studentAPI } from "../../service/api";
import { useAuth } from "../../context/AuthContext";
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDoorOpen,
    faUser,
    faPhone,
    faEnvelope,
    faLocationDot,
    faCalendarCheck,
    faRulerCombined,
    faClipboardList,
    faUserSlash // New icon for no roommate
} from '@fortawesome/free-solid-svg-icons';

const RoomPage = () => {
  const { user } = useAuth();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { studentId } = useParams();

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        setError(null);
        // Use the actual studentId from URL or fallback to user.id
        const actualStudentId = studentId || user.id;
        const res = await studentAPI.getRoomInfo(actualStudentId);
        console.log("Room API Response:", res.data); // Debug log
        setRoomData(res.data);
      } catch (err) {
        console.error("Error loading room info:", err);
        setError("Failed to load room information");
      } finally {
        setLoading(false);
      }
    };
    fetchRoomInfo();
  }, [studentId, user.id]);

  // Consistent card style from StudentDashboard
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e8c8b5ff',
    padding: '1.5rem',
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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#d32f2f', fontSize: '1.125rem' }}>
          {error}
        </div>
      </div>
    );
  }

  const { room, roommate } = roomData || {};

  // Check if roommate exists and has valid data
  const hasRoommate = roommate && roommate.id && roommate.id !== user.id;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#faf7f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            color: '#000000',
            fontSize: '2.25rem',
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: '-0.033em',
            marginBottom: '0.5rem',
          }}>
            My Room
          </h1>
          <p style={{
            color: '#191919ff',
            fontSize: '1rem',
            fontWeight: 400,
          }}>
            {room ? `Room ${room.roomNum} - Block ${room.block}, Floor ${room.floor}` : "No room assigned"}
          </p>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}>
          <style>
            {`
              @media (min-width: 1024px) {
                .room-grid-responsive {
                  grid-template-columns: 1fr 1fr !important;
                  gap: 2rem !important;
                }
              }
            `}
          </style>
          <div className="room-grid-responsive" style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
            alignItems: 'stretch',
          }}>
            {/* Left Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}>
              {/* Room Details Card */}
              <div style={cardStyle}>
                <h2 style={{
                  color: '#000000',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                }}>
                  Room Details
                </h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0',
                    borderTop: '1px solid #e2d6cf',
                  }}>
                    <span style={{
                      color: '#191919ff',
                      fontSize: '1rem',
                      fontWeight: 400,
                    }}>
                      Room Number
                    </span>
                    <span style={{
                      color: '#69301cff',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}>
                      {room?.roomNum || 'Not assigned'}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0',
                    borderTop: '1px solid #e2d6cf',
                  }}>
                    <span style={{
                      color: '#191919ff',
                      fontSize: '1rem',
                      fontWeight: 400,
                    }}>
                      Block
                    </span>
                    <span style={{
                      color: '#69301cff',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}>
                      {room?.block ? `Block ${room.block}` : 'Not assigned'}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0',
                    borderTop: '1px solid #e2d6cf',
                  }}>
                    <span style={{
                      color: '#191919ff',
                      fontSize: '1rem',
                      fontWeight: 400,
                    }}>
                      Floor
                    </span>
                    <span style={{
                      color: '#69301cff',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}>
                      {room?.floor ? `${room.floor}` : 'Not assigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roommates Card */}
              <div style={cardStyle}>
                <h2 style={{
                  color: '#000000',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                }}>
                  Roommates
                </h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                }}>
                  {hasRoommate ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                    }}>
                      <span style={{ color: '#CD853F', fontSize: '1.5rem' }}>
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                      }}>
                        <p style={{
                          color: '#000000',
                          fontSize: '1rem',
                          fontWeight: 700,
                          margin: '0 0 0.5rem 0',
                        }}>
                          {roommate.name}
                        </p>
                        <p style={{
                          color: '#928d8dff',
                          fontSize: '0.875rem',
                          margin: '0 0 0.5rem 0',
                        }}>
                          {roommate.major || 'Major not specified'}
                        </p>
                        {roommate.email && (
                          <a 
                            style={{
                              color: '#806e6eff',
                              fontSize: '0.875rem',
                              textDecoration: 'none',
                              fontWeight: 500,
                            }}
                            href={`mailto:${roommate.email}`}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                          >
                            {roommate.email}
                          </a>
                        )}
                        {roommate.phoneNum && (
                          <p style={{
                            color: '#928d8dff',
                            fontSize: '0.875rem',
                            margin: '0.5rem 0 0 0',
                          }}>
                            Phone: {roommate.phoneNum}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '0.5rem',
                      border: '1px dashed #dee2e6',
                    }}>
                      <span style={{ color: '#6c757d', fontSize: '1.5rem' }}>
                        <FontAwesomeIcon icon={faUserSlash} />
                      </span>
                      <div>
                        <p style={{
                          color: '#6c757d',
                          fontSize: '1rem',
                          fontWeight: 500,
                          margin: 0,
                        }}>
                          No roommate assigned
                        </p>
                        <p style={{
                          color: '#868e96',
                          fontSize: '0.875rem',
                          margin: '0.25rem 0 0 0',
                        }}>
                          You currently don't have a roommate in this room.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Rest of your existing code remains the same */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}>
              {/* Contact Information Card */}
              <div style={cardStyle}>
                <h2 style={{
                  color: '#000000',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                }}>
                  Contact Information
                </h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ color: '#CD853F', fontSize: '1.5rem', marginTop: '0.125rem',paddingRight:'10px'}}>
                      <FontAwesomeIcon icon={faPhone} />
                    </span>
                    <div>
                      <p style={{ fontSize: '1rem', color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Phone</p>
                      <a 
                        style={{ 
                          fontWeight: 500, 
                          color: '#191919ff', 
                          margin: 0, 
                          textDecoration: 'none' 
                        }}
                        href="tel:+1234567890"
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        +1 (234) 567-890
                      </a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ color: '#CD853F', fontSize: '1.5rem', marginTop: '0.125rem',paddingRight:'10px' }}>
                      <FontAwesomeIcon icon={faEnvelope} />
                    </span>
                    <div>
                      <p style={{ fontSize: '1rem', color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Email</p>
                      <a 
                        style={{ 
                          fontWeight: 500, 
                          color: '#191919ff', 
                          margin: 0, 
                          textDecoration: 'none' 
                        }}
                        href="mailto:manager@mfudorm.com"
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        manager@mfudorm.com
                      </a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ color: '#CD853F', fontSize: '1.5rem', marginTop: '0.125rem',paddingRight:'10px' }}>
                      <FontAwesomeIcon icon={faLocationDot} />
                    </span>
                    <div>
                      <p style={{ fontSize: '1rem', color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Address</p>
                      <p style={{ fontWeight: 500, color: '#191919ff', margin: 0 }}>123 University Drive, MFU City</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Status Card */}
              <div style={{
                ...cardStyle,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}>
                <h2 style={{
                  color: '#000000',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                }}>
                  Room Status
                </h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  flex: 1,
                  justifyContent: 'space-between',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0',
                    borderTop: '1px solid #e2d6cf',
                  }}>
                    <span style={{
                      color: '#191919ff',
                      fontSize: '1rem',
                      fontWeight: 400,
                    }}>
                      Occupancy
                    </span>
                    <span style={{
                      color: '#69301cff',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}>
                      {room?.occupancy || '0'} / 2
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0',
                    borderTop: '1px solid #e2d6cf',
                  }}>
                    <span style={{
                      color: '#191919ff',
                      fontSize: '1rem',
                      fontWeight: 400,
                    }}>
                      Last Inspection
                    </span>
                    <span style={{
                      color: '#69301cff',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}>
                      {room?.lastInspect || 'Not available'}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0',
                    borderTop: '1px solid #e2d6cf',
                  }}>
                    <span style={{
                      color: '#191919ff',
                      fontSize: '1rem',
                      fontWeight: 400,
                    }}>
                      Duration
                    </span>
                    <span style={{
                      color: '#69301cff',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}>
                      {room?.duration ? `${room.duration} Year` : 'Not specified'}
                    </span>
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

export default RoomPage;