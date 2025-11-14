import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../service/api';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPhone,
    faEnvelope,
    faLocationDot,
    faDoorOpen,
    faTriangleExclamation,
    faScrewdriverWrench,
    faBuilding,
    faSearch,
    faEye,
    faArrowUp,
    faList
} from '@fortawesome/free-solid-svg-icons';

const ServicePage = () => {
  const { user } = useAuth();
  const { studentId } = useParams();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [dormitoryInfo, setDormitoryInfo] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const requestsSectionRef = useRef(null);
  const topSectionRef = useRef(null);

  const [formData, setFormData] = useState({
    serviceType: '',
    priorityLvl: 'low',
    description: '',
    preferredDate: '',
    preferredTime: '',
    timePeriod: 'AM'
  });

  const [timePickerState, setTimePickerState] = useState({
    hour: '09',
    minute: '00',
    period: 'AM'
  });

  // Card style consistent with StudentDashboard
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e8c8b5ff',
    padding: '1.5rem',
  };

  // Consistent font sizes
  const typography = {
    heading: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    subheading: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    body: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    small: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: 600,
    }
  };

  useEffect(() => {
    fetchServiceRequests();
    fetchRoomInfo();
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [studentId]);

  useEffect(() => {
    filterRequests();
  }, [serviceRequests, searchTerm]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getServiceHistory(studentId);
      const requests = response.data || [];
      
      const sortedRequests = requests.sort((a, b) => {
        const dateA = new Date(a.date || a.dateTime);
        const dateB = new Date(b.date || b.dateTime);
        return dateB - dateA;
      });
      
      setServiceRequests(sortedRequests);
    } catch (err) {
      console.error('Error fetching service requests:', err);
      setServiceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomInfo = async () => {
    try {
      const response = await studentAPI.getRoomInfo(studentId);
      if (response.data) {
        setRoomInfo(response.data);
        if (response.data.room && response.data.room.dormitory) {
          setDormitoryInfo(response.data.room.dormitory);
        }
      }
    } catch (err) {
      console.error('Error fetching room info:', err);
    }
  };

  const filterRequests = () => {
    if (!searchTerm.trim()) {
      setFilteredRequests(serviceRequests);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = serviceRequests.filter(request =>
      request.description?.toLowerCase().includes(searchLower) ||
      request.serviceType?.toLowerCase().includes(searchLower) ||
      request.status?.toLowerCase().includes(searchLower) ||
      (request.priorityLvl && request.priorityLvl.toLowerCase().includes(searchLower)) ||
      (request.id && request.id.toString().includes(searchTerm))
    );
    setFilteredRequests(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimePickerToggle = () => {
    if (formData.preferredTime) {
      const [hour, minute] = formData.preferredTime.split(':');
      setTimePickerState(prev => ({
        ...prev,
        hour: hour.padStart(2, '0'),
        minute: minute.padStart(2, '0'),
        period: formData.timePeriod
      }));
    }
    setShowTimePicker(!showTimePicker);
  };

  const handleTimeChange = (type, value) => {
    setTimePickerState(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const confirmTime = () => {
    const timeString = `${timePickerState.hour}:${timePickerState.minute}`;
    setFormData(prev => ({
      ...prev,
      preferredTime: timeString,
      timePeriod: timePickerState.period
    }));
    setShowTimePicker(false);
  };

  const cancelTime = () => {
    setShowTimePicker(false);
  };

  const generateHours = () => {
    const hours = [];
    for (let i = 1; i <= 12; i++) {
      hours.push(i.toString().padStart(2, '0'));
    }
    return hours;
  };

  const generateMinutes = () => {
    const minutes = [];
    for (let i = 0; i < 60; i += 5) {
      minutes.push(i.toString().padStart(2, '0'));
    }
    return minutes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const requestData = {
        serviceType: formData.serviceType,
        priorityLvl: formData.priorityLvl,
        description: formData.description,
      };

      await studentAPI.createServiceRequest(studentId, requestData);
      
      setFormData({
        serviceType: '',
        priorityLvl: 'low',
        description: '',
        preferredDate: '',
        preferredTime: '',
        timePeriod: 'AM'
      });

      setTimePickerState({
        hour: '09',
        minute: '00',
        period: 'AM'
      });

      fetchServiceRequests();
      
      alert('Service request submitted successfully!');
    } catch (err) {
      console.error('Error submitting service request:', err);
      alert('Failed to submit service request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const scrollToRequests = () => {
    requestsSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'PENDING': {
        backgroundColor: '#fff3cd',
        color: '#856404',
        borderColor: '#ffeaa7'
      },
      'APPROVED': {
        backgroundColor: '#d4edda',
        color: '#155724',
        borderColor: '#c3e6cb'
      },
      'IN PROGRESS': {
        backgroundColor: '#cce7ff',
        color: '#004085',
        borderColor: '#b3d7ff'
      },
      'RESOLVED': {
        backgroundColor: '#d4edda',
        color: '#155724',
        borderColor: '#c3e6cb'
      }
    };

    const normalizedStatus = (status || 'PENDING').toUpperCase();
    const style = statusStyles[normalizedStatus] || statusStyles['PENDING'];
    const label = normalizedStatus === 'IN PROGRESS' ? 'IN PROGRESS' : 
                  normalizedStatus === 'PENDING' ? 'PENDING' : 
                  normalizedStatus;

    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: style.backgroundColor,
        color: style.color,
        border: `1px solid ${style.borderColor}`,
      }}>
        {label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateDescription = (description, maxLength = 60) => {
    if (!description) return 'No description';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const displayRequests = serviceRequests.length > 0 ? serviceRequests : [];
  const displayFilteredRequests = serviceRequests.length > 0 ? filteredRequests : [];

  return (
    <div style={{ padding: '2rem', backgroundColor: '#faf7f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }} ref={topSectionRef}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem',
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8rem',
                marginBottom: '0.5rem',
              }}>
                <h1 style={{
                  color: '#000000',
                  fontSize: '2.25rem',
                  fontWeight: 600,
                  lineHeight: 1.25,
                  letterSpacing: '-0.033em',
                  margin: 0,
                }}>
                  Service Request Dashboard
                </h1>
              </div>
              
              <p style={{
                color: '#191919ff',
                fontSize: '1rem',
                fontWeight: 400,
                marginBottom:'2rem'
              }}>
                Submit and track your maintenance and service requests
              </p>
              
              <button
                type="button"
                onClick={scrollToRequests}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#7d2923',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 510,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#6a221d'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#7d2923'}
              >
                <FontAwesomeIcon icon={faList} />
                View My Requests
              </button>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem',
          alignItems: 'stretch',
          marginBottom: '2rem',
        }}>
          {/* Left Column - Submit Form */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}>
            <div style={{
              ...cardStyle,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  color: '#000000',
                  ...typography.heading,
                  marginBottom: '0.5rem',
                }}>
                  Submit Service Request
                </h2>
                <p style={{
                  color: '#191919ff',
                  ...typography.body,
                }}>
                  Please fill out the form below to submit a service request.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem',
                flex: 1,
              }}>
                {/* Service Type */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#000000',
                    ...typography.label,
                    marginBottom: '0.5rem',
                  }}>Service Type</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2d6cf',
                      borderRadius: '0.375rem',
                      backgroundColor: '#ffffff',
                      ...typography.body,
                      height: '48px',
                    }}
                  >
                    <option value="">Select service type...</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Furniture">Furniture Repair</option>
                    <option value="Wi-Fi">Wi-Fi Issue</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Priority Level */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#000000',
                    ...typography.label,
                    marginBottom: '0.75rem',
                  }}>Priority Level</label>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    {['low', 'medium', 'high'].map(level => (
                      <label key={level} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        cursor: 'pointer',
                      }}>
                        <input
                          type="radio"
                          name="priorityLvl"
                          value={level}
                          checked={formData.priorityLvl === level}
                          onChange={handleInputChange}
                          style={{ margin: 0 }}
                        />
                        <span style={{ 
                          ...typography.body,
                          color: '#191919ff',
                          textTransform: 'capitalize'
                        }}>{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{
                    display: 'block',
                    color: '#000000',
                    ...typography.label,
                    marginBottom: '0.5rem',
                  }}>Description of Issue</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      flex: 1,
                      minHeight: '140px',
                      padding: '0.75rem',
                      border: '1px solid #e2d6cf',
                      borderRadius: '0.375rem',
                      backgroundColor: '#ffffff',
                      ...typography.body,
                      resize: 'vertical',
                    }}
                    placeholder="Please provide a detailed description of the problem..."
                  />
                </div>

                {/* Preferred Date and Time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#000000',
                      ...typography.label,
                      marginBottom: '0.5rem',
                    }}>Preferred Date</label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2d6cf',
                        borderRadius: '0.375rem',
                        backgroundColor: '#ffffff',
                        ...typography.body,
                        height: '48px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#000000',
                      ...typography.label,
                      marginBottom: '0.5rem',
                    }}>Preferred Time</label>
                    <div 
                      onClick={handleTimePickerToggle}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2d6cf',
                        borderRadius: '0.375rem',
                        backgroundColor: '#ffffff',
                        ...typography.body,
                        height: '48px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ 
                        color: formData.preferredTime ? '#191919ff' : '#928d8dff'
                      }}>
                        {formData.preferredTime ? 
                          `${formData.preferredTime} ${formData.timePeriod}` : 
                          'Select time...'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginTop: '1rem',
                }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '0.75rem 2rem',
                      backgroundColor: '#7d2923',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '0.375rem',
                      ...typography.body,
                      fontWeight: 510,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.6 : 1,
                      transition: 'background-color 0.2s',
                      minWidth: '200px',
                    }}
                    onMouseEnter={(e) => {
                      if (!submitting) e.target.style.backgroundColor = '#6a221d';
                    }}
                    onMouseLeave={(e) => {
                      if (!submitting) e.target.style.backgroundColor = '#7d2923';
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Service Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            height: '100%',
          }}>
            {/* Contact Information */}
            <div style={cardStyle}>
              <h3 style={{
                color: '#000000',
                ...typography.heading,
                marginBottom: '1.5rem',
              }}>
                Contact Information
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#CD853F', fontSize: '1.1rem', marginTop: '0.125rem', minWidth: '20px' }}>
                    <FontAwesomeIcon icon={faPhone} />
                  </span>
                  <div>
                    <p style={{ ...typography.small, color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Dormitory Office Phone</p>
                    <p style={{ fontWeight: 500, color: '#191919ff', margin: 0, ...typography.body }}>
                      {dormitoryInfo?.phoneNum || '(555) 123-4567'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#CD853F', fontSize: '1.1rem', marginTop: '0.125rem', minWidth: '20px' }}>
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                  <div>
                    <p style={{ ...typography.small, color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Maintenance Emergency Email</p>
                    <p style={{ fontWeight: 500, color: '#191919ff', margin: 0, ...typography.body }}>
                      {dormitoryInfo?.email || 'support@dormservices.edu'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#CD853F', fontSize: '1.1rem', marginTop: '0.125rem', minWidth: '20px' }}>
                    <FontAwesomeIcon icon={faLocationDot} />
                  </span>
                  <div>
                    <p style={{ ...typography.small, color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Physical Address</p>
                    <p style={{ fontWeight: 500, color: '#191919ff', margin: 0, ...typography.small }}>
                      {dormitoryInfo ? (
                        <>
                          {dormitoryInfo.buildingName && `${dormitoryInfo.buildingName}, `}
                          {dormitoryInfo.address}
                          {dormitoryInfo.buildingNum && `, Building ${dormitoryInfo.buildingNum}`}
                        </>
                      ) : (
                        '123 University Drive, Student Hall A'
                      )}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#CD853F', fontSize: '1.1rem', marginTop: '0.125rem', minWidth: '20px' }}>
                    <FontAwesomeIcon icon={faDoorOpen} />
                  </span>
                  <div>
                    <p style={{ ...typography.small, color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Your Room</p>
                    <p style={{ fontWeight: 500, color: '#191919ff', margin: 0, ...typography.body }}>
                      {roomInfo?.room ? (
                        `Room ${roomInfo.room.roomNum}, Floor ${roomInfo.room.floor}, Block ${roomInfo.room.block}`
                      ) : (
                        'Room not assigned'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Hours */}
            <div style={cardStyle}>
              <h3 style={{
                color: '#000000',
                ...typography.heading,
                marginBottom: '1.5rem',
              }}>
                Service Hours
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#CD853F', fontSize: '1.1rem', marginTop: '0.125rem', minWidth: '20px' }}>
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                  </span>
                  <div>
                    <p style={{ ...typography.small, color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Emergency Services</p>
                    <p style={{ fontWeight: 500, color: '#191919ff', margin: 0, ...typography.body }}>24/7 Availability</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#CD853F', fontSize: '1.1rem', marginTop: '0.125rem', minWidth: '20px' }}>
                    <FontAwesomeIcon icon={faScrewdriverWrench} />
                  </span>
                  <div>
                    <p style={{ ...typography.small, color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>General Maintenance</p>
                    <p style={{ fontWeight: 500, color: '#191919ff', margin: 0, ...typography.body }}>Mon-Fri, 9:00 AM - 5:00 PM</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#CD853F', fontSize: '1.1rem', marginTop: '0.125rem', minWidth: '20px' }}>
                    <FontAwesomeIcon icon={faBuilding} />
                  </span>
                  <div>
                    <p style={{ ...typography.small, color: '#000000', margin: '0 0 0.25rem 0', fontWeight: "bold" }}>Dormitory Office</p>
                    <p style={{ fontWeight: 500, color: '#191919ff', margin: 0, ...typography.body }}>Mon-Sat, 8:00 AM - 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Service Requests Section */}
        <div style={cardStyle} ref={requestsSectionRef}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              color: '#000000',
              ...typography.heading,
              margin: 0,
            }}>
              My Service Requests
            </h2>
            
            <div style={{
              position: 'relative',
              width: '300px',
            }}>
              <span style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#CD853F',
              }}>
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #e2d6cf',
                  borderRadius: '0.375rem',
                  backgroundColor: '#ffffff',
                  ...typography.small,
                }}
              />
            </div>
          </div>

          {loading ? (
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
          ) : (
            <div className="requests-table-container">
              <div className="requests-table-wrapper" style={{
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #e2d6cf',
                borderRadius: '0.375rem',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ 
                      borderBottom: '1px solid #e2d6cf',
                      backgroundColor: '#faf7f5',
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                    }}>
                      <th style={{ 
                        padding: '1rem', 
                        textAlign: 'left', 
                        ...typography.small,
                        fontWeight: 600,
                        color: '#000000'
                      }}>ID</th>
                      <th style={{ 
                        padding: '1rem', 
                        textAlign: 'left', 
                        ...typography.small,
                        fontWeight: 600,
                        color: '#000000'
                      }}>Description</th>
                      <th style={{ 
                        padding: '1rem', 
                        textAlign: 'left', 
                        ...typography.small,
                        fontWeight: 600,
                        color: '#000000'
                      }}>Service Type</th>
                      <th style={{ 
                        padding: '1rem', 
                        textAlign: 'left', 
                        ...typography.small,
                        fontWeight: 600,
                        color: '#000000'
                      }}>Status</th>
                      <th style={{ 
                        padding: '1rem', 
                        textAlign: 'left', 
                        ...typography.small,
                        fontWeight: 600,
                        color: '#000000'
                      }}>Date</th>
                      <th style={{ 
                        padding: '1rem',
                        paddingRight:'0.1rem',
                        textAlign: 'left', 
                        ...typography.small,
                        fontWeight: 600,
                        color: '#000000'
                      }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayFilteredRequests.map((request, index) => (
                      <tr key={request.id || index} style={{ borderBottom: '1px solid #e2d6cf' }}>
                        <td style={{ 
                          padding: '1rem', 
                          ...typography.small,
                          color: '#191919ff',
                          fontFamily: 'monospace'
                        }}>#{request.id}</td>
                        <td style={{ 
                          padding: '1rem', 
                          ...typography.small,
                          color: '#191919ff',
                          maxWidth: '200px',
                        }} title={request.description}>
                          {truncateDescription(request.description)}
                        </td>
                        <td style={{ 
                          padding: '1rem', 
                          ...typography.small,
                          color: '#191919ff'
                        }}>{request.serviceType}</td>
                        <td style={{ padding: '1rem' }}>{getStatusBadge(request.status)}</td>
                        <td style={{ 
                          padding: '1rem', 
                          ...typography.small,
                          color: '#191919ff'
                        }}>{formatDate(request.date || request.dateTime)}</td>
                        <td style={{ padding: '1rem', paddingRight:'0.1rem',textAlign: 'left' }}>
                          <button
                            onClick={() => handleViewDetails(request)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#CD853F',
                              cursor: 'pointer',
                              fontSize: '1rem',
                            }}
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {displayFilteredRequests.length === 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem',
                    color: '#191919ff',
                    ...typography.body,
                  }}>
                    {searchTerm ? 'No service requests found matching your search.' : 'No service requests available.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Back to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '3rem',
              height: '3rem',
              backgroundColor: '#CD853F',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 100,
              transition: 'background-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#c36e19ff';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#c36e19ff';
              e.target.style.transform = 'translateY(0)';
            }}
            title="Back to Top"
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        )}
      </div>

      {/* Time Picker Dialog - Remains the same */}
      {showTimePicker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }} onClick={cancelTime}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <h3 style={{
                color: '#000000',
                ...typography.subheading,
                margin: 0,
              }}>Select Time</h3>
              <button onClick={cancelTime} style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: '#191919ff',
              }}>
                
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  ...typography.label,
                  color: '#000000',
                  marginBottom: '0.5rem',
                }}>Hour</div>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #e2d6cf',
                  borderRadius: '0.375rem',
                }}>
                  {generateHours().map(hour => (
                    <div
                      key={hour}
                      style={{
                        padding: '0.5rem',
                        cursor: 'pointer',
                        backgroundColor: timePickerState.hour === hour ? '#7d2923' : 'transparent',
                        color: timePickerState.hour === hour ? '#ffffff' : '#191919ff',
                        textAlign: 'center',
                        ...typography.small,
                      }}
                      onClick={() => handleTimeChange('hour', hour)}
                    >
                      {hour}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  ...typography.label,
                  color: '#000000',
                  marginBottom: '0.5rem',
                }}>Minute</div>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #e2d6cf',
                  borderRadius: '0.375rem',
                }}>
                  {generateMinutes().map(minute => (
                    <div
                      key={minute}
                      style={{
                        padding: '0.5rem',
                        cursor: 'pointer',
                        backgroundColor: timePickerState.minute === minute ? '#7d2923' : 'transparent',
                        color: timePickerState.minute === minute ? '#ffffff' : '#191919ff',
                        textAlign: 'center',
                        ...typography.small,
                      }}
                      onClick={() => handleTimeChange('minute', minute)}
                    >
                      {minute}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  ...typography.label,
                  color: '#000000',
                  marginBottom: '0.5rem',
                }}>Period</div>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #e2d6cf',
                  borderRadius: '0.375rem',
                }}>
                  {['AM', 'PM'].map(period => (
                    <div
                      key={period}
                      style={{
                        padding: '0.5rem',
                        cursor: 'pointer',
                        backgroundColor: timePickerState.period === period ? '#7d2923' : 'transparent',
                        color: timePickerState.period === period ? '#ffffff' : '#191919ff',
                        textAlign: 'center',
                        ...typography.small,
                      }}
                      onClick={() => handleTimeChange('period', period)}
                    >
                      {period}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
            }}>
              <button onClick={cancelTime} style={{
                padding: '0.5rem 1rem',
                border: '1px solid #e2d6cf',
                borderRadius: '0.375rem',
                backgroundColor: 'transparent',
                color: '#191919ff',
                cursor: 'pointer',
                ...typography.small,
              }}>
                Cancel
              </button>
              <button onClick={confirmTime} style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                backgroundColor: '#7d2923',
                color: '#ffffff',
                cursor: 'pointer',
                ...typography.small,
              }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal - Remains the same */}
      {showModal && selectedRequest && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }} onClick={closeModal}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}>
              <h3 style={{
                color: '#000000',
                ...typography.subheading,
                margin: 0,
              }}>Request Details</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}>
                <div>
                  <div style={{
                    ...typography.label,
                    color: '#000000',
                    marginBottom: '0.25rem',
                  }}>Request ID</div>
                  <div style={{
                    color: '#191919ff',
                    fontFamily: 'monospace',
                    ...typography.body
                  }}>#{selectedRequest.id}</div>
                </div>
                <div>
                  <div style={{
                    ...typography.label,
                    color: '#000000',
                    marginBottom: '0.25rem',
                  }}>Status</div>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <div style={{
                    ...typography.label,
                    color: '#000000',
                    marginBottom: '0.25rem',
                  }}>Service Type</div>
                  <div style={{ color: '#191919ff', ...typography.body }}>{selectedRequest.serviceType}</div>
                </div>
                <div>
                  <div style={{
                    ...typography.label,
                    color: '#000000',
                    marginBottom: '0.25rem',
                  }}>Priority</div>
                  <div style={{ 
                    color: '#191919ff',
                    textTransform: 'capitalize',
                    ...typography.body
                  }}>{selectedRequest.priorityLvl || 'Not specified'}</div>
                </div>
              </div>

              <div>
                <div style={{
                  ...typography.label,
                  color: '#000000',
                  marginBottom: '0.5rem',
                }}>Description</div>
                <div style={{
                  color: '#191919ff',
                  lineHeight: 1.5,
                  ...typography.body
                }}>{selectedRequest.description}</div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}>
                <div>
                  <div style={{
                    ...typography.label,
                    color: '#000000',
                    marginBottom: '0.25rem',
                  }}>Submitted Date</div>
                  <div style={{ color: '#191919ff', ...typography.body }}>
                    {formatDate(selectedRequest.date || selectedRequest.dateTime)}
                  </div>
                </div>
                <div>
                  <div style={{
                    ...typography.label,
                    color: '#000000',
                    marginBottom: '0.25rem',
                  }}>Room Number</div>
                  <div style={{ color: '#191919ff', ...typography.body }}>
                    {roomInfo?.room ? `Room ${roomInfo.room.roomNum}` : 'Not assigned'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '1.5rem',
            }}>
              <button onClick={closeModal} style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                backgroundColor: '#7d2923',
                color: '#ffffff',
                cursor: 'pointer',
                ...typography.small,
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePage;