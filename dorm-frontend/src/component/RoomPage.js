// src/component/RoomPage.js
import React, { useEffect, useState } from "react";
import { studentAPI } from "../service/api";
import { useAuth } from "../context/AuthContext";
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
    faClipboardList
} from '@fortawesome/free-solid-svg-icons';

const RoomPage = () => {
  const { user } = useAuth();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { studentId } = useParams();

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const res = await studentAPI.getRoomInfo(user.id);
        setRoomData(res.data);
      } catch (err) {
        console.error("Error loading room info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomInfo();
  }, [studentId]);

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

  const { room, roommate } = roomData || {};

  return (
    <div style={{ padding: '2rem', backgroundColor: '#faf7f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section - Exactly like StudentDashboard */}
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
            Room {room?.roomNum || "205B"} - Block {room?.block || "A"}, Floor {room?.floor || "2"}
          </p>
        </div>

        {/* Main Content Grid - Consistent 2-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}>
          {/* For larger screens, use 2 columns */}
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
                      fontSize: '0.875rem',
                      fontWeight: 400,
                    }}>
                      Room Number
                    </span>
                    <span style={{
                      color: '#69301cff',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}>
                      {room?.roomNum || '205B'}
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
                      fontSize: '0.875rem',
                      fontWeight: 400,
                    }}>
                      Building/Block
                    </span>
                    <span style={{
                      color: '#69301cff',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}>
                      Block {room?.block || 'A'}
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
                      fontSize: '0.875rem',
                      fontWeight: 400,
                    }}>
                      Floor
                    </span>
                    <span style={{
                      color: '#69301cff',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}>
                      {room?.floor || '2nd Floor'}
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
                        {roommate?.name || 'Sarah Johnson'}
                      </p>
                      <p style={{
                        color: '#928d8dff',
                        fontSize: '0.875rem',
                        margin: '0 0 0.5rem 0',
                      }}>
                        {roommate?.major || 'Software Engineering'}
                      </p>
                      <a 
                        style={{
                          color: '#806e6eff',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                        href={`mailto:${roommate?.email || 'sarah.johnson@mfu.edu'}`}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {roommate?.email || 'sarah.johnson@mfu.edu'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}>
              {/* Contact Information Card - Consistent with StudentDashboard */}
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
                      <p style={{ fontSize: '0.875rem', color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Phone</p>
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
                      <p style={{ fontSize: '0.875rem', color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Email</p>
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
                      <p style={{ fontSize: '0.875rem', color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Address</p>
                      <p style={{ fontWeight: 500, color: '#191919ff', margin: 0 }}>123 University Drive, MFU City</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Status Card - Adjusted to match Roommates height */}
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
                      {room?.occupancy || '2'} / 2
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
                      {room?.lastInspect || 'Jan 5, 2025'}
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
                      {room?.duration+" Year" || '1 Year'}
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