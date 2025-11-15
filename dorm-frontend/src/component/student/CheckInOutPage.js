import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../service/api';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendar, 
  faCircleCheck, 
  faDoorOpen, 
  faExclamationTriangle,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faHistory,
  faArrowDown,
  faList,
  faArrowUp,
  faFilter
} from '@fortawesome/free-solid-svg-icons';

const CheckInOutPage = () => {
  const { user } = useAuth();
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const [studentData, setStudentData] = useState({
    name: '',
    id: '',
    roomNumber: ''
  });
  const [formData, setFormData] = useState({
    requestType: 'check-in',
    requestDate: '',
    confirmation: false
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [existingRequests, setExistingRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [errors, setErrors] = useState({
    duplicate: '',
    date: '',
    chronological: '',
    general: '',
    confirmation: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved'

  const historySectionRef = useRef(null);
  const topSectionRef = useRef(null);

  useEffect(() => {
    fetchStudentData();
    fetchExistingRequests();
    fetchCheckInOutHistory();
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [studentId]);

  useEffect(() => {
    filterAndSortHistory();
  }, [history, statusFilter]);

  const filterAndSortHistory = () => {
    let filtered = [...history];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => 
        request.status?.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    // Sort: PENDING first, then APPROVED, then others, with newest dates first within each status
    filtered.sort((a, b) => {
      // First, sort by status priority
      const statusOrder = {
        'PENDING': 1,
        'APPROVED': 2,
        'REJECTED': 3
      };

      const statusA = statusOrder[a.status?.toUpperCase()] || 4;
      const statusB = statusOrder[b.status?.toUpperCase()] || 4;

      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // If same status, sort by date (newest first)
      return new Date(b.date) - new Date(a.date);
    });

    setFilteredHistory(filtered);
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch room info to get room number
      const roomResponse = await studentAPI.getRoomInfo(studentId);
      if (roomResponse.data) {
        setRoomInfo(roomResponse.data);
        const roomNumber = roomResponse.data.room?.roomNum || 'Not assigned';
        
        setStudentData({
          name: user?.name || 'Student',
          id: studentId,
          roomNumber: roomNumber
        });
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      // Fallback to basic user data
      setStudentData({
        name: user?.name || 'Student',
        id: studentId,
        roomNumber: 'Not assigned'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingRequests = async () => {
    try {
      const response = await studentAPI.getCheckInOutHistory(studentId);
      if (response.data) {
        setExistingRequests(response.data);
      }
    } catch (err) {
      console.error('Error fetching existing requests:', err);
    }
  };

  const fetchCheckInOutHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await studentAPI.getCheckInOutHistory(studentId);
      if (response.data) {
        setHistory(response.data);
      }
    } catch (err) {
      console.error('Error fetching check-in/out history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const checkForDuplicateRequest = (type, date) => {
    return existingRequests.some(request => 
      request.date === date && 
      request.status === 'PENDING' &&
      request.type?.toUpperCase() === type.toUpperCase()
    );
  };

  const validateDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return { isValid: false, message: 'Date cannot be in the past. Please select today or a future date.' };
    }
    
    return { isValid: true, message: '' };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear errors when user starts typing
    if (name === 'requestDate') {
      setErrors(prev => ({ ...prev, date: '', duplicate: '' }));
    }
    if (name === 'confirmation') {
      setErrors(prev => ({ ...prev, confirmation: '' }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({ duplicate: '', date: '', chronological: '', general: '', confirmation: '' });

    // Validate confirmation
    if (!formData.confirmation) {
      setErrors(prev => ({ ...prev, confirmation: 'Please confirm that all information provided is accurate.' }));
      return;
    }

    // Validate date
    if (!formData.requestDate) {
      setErrors(prev => ({ ...prev, date: 'Please select a date for your request.' }));
      return;
    }

    const dateValidation = validateDate(formData.requestDate);
    if (!dateValidation.isValid) {
      setErrors(prev => ({ ...prev, date: dateValidation.message }));
      return;
    }

    // Check for duplicate request (same type for the same date)
    const backendType = formData.requestType === 'check-in' ? 'Check-in' : 'Check-out';
    if (checkForDuplicateRequest(backendType, formData.requestDate)) {
      setErrors(prev => ({ 
        ...prev, 
        duplicate: `You already have a pending ${formData.requestType} request for ${formData.requestDate}. Please wait for it to be processed or choose a different date.` 
      }));
      return;
    }

    setSubmitting(true);

    try {
      // Prepare request data according to backend expectations
      const requestData = {
        type: backendType, // Backend expects CHECKIN or CHECKOUT
        date: formData.requestDate // Backend expects just the date
      };

      console.log('Submitting request:', requestData); // For debugging

      await studentAPI.submitCheckInOut(studentId, requestData);
      
      // Show success modal instead of alert
      setSuccessMessage(`${formData.requestType === 'check-in' ? 'Check-in' : 'Check-out'} request submitted successfully!`);
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        requestType: 'check-in',
        requestDate: '',
        confirmation: false
      });
      
      // Refresh existing requests and history to include the new one
      await fetchExistingRequests();
      await fetchCheckInOutHistory();
      
    } catch (err) {
      console.error('Error submitting check-in/out request:', err);
      console.error('Error details:', err.response?.data);
      
      let errorMessage = 'Failed to submit request. Please try again.';
      if (err.response?.data) {
        errorMessage = typeof err.response.data === 'string' 
          ? err.response.data 
          : 'Server error occurred. Please try again.';
      }
      
      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/student/${studentId}/dashboard`);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
  };

  const scrollToHistory = () => {
    historySectionRef.current?.scrollIntoView({ 
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

  // Get status badge style
  const getStatusBadge = (status) => {
    const baseStyle = {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'capitalize'
    };

    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return {
          ...baseStyle,
          backgroundColor: '#d1fae5',
          color: '#065f46'
        };
      case 'PENDING':
        return {
          ...baseStyle,
          backgroundColor: '#fef3c7',
          color: '#92400e'
        };
      case 'REJECTED':
        return {
          ...baseStyle,
          backgroundColor: '#fee2e2',
          color: '#991b1b'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#f3f4f6',
          color: '#374151'
        };
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return faCheckCircle;
      case 'PENDING':
        return faClock;
      case 'REJECTED':
        return faTimesCircle;
      default:
        return faClock;
    }
  };

  // Get status icon color
  const getStatusIconColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'REJECTED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get today's date in YYYY-MM-DD format for the date input
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e8c8b5ff'
  };

  const errorStyle = {
    color: '#dc2626',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const infoStyle = {
    color: '#6b7280',
    fontSize: '0.75rem',
    marginTop: '0.5rem'
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#faf7f5',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '3rem',
              height: '3rem',
              borderRadius: '9999px',
              backgroundColor: '#d1fae5',
              margin: '0 auto 1rem'
            }}>
              <FontAwesomeIcon 
                icon={faCheckCircle} 
                style={{ 
                  color: '#10b981',
                  fontSize: '1.5rem'
                }} 
              />
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#000000',
              marginBottom: '0.5rem'
            }}>
              Success!
            </h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem'
            }}>
              {successMessage}
            </p>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleCloseSuccessModal}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleCloseSuccessModal();
                  scrollToHistory();
                }}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid transparent',
                  backgroundColor: '#7d2923',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#69301cff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#7d2923';
                }}
              >
                View History
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{
        maxWidth: '56rem',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Header Section */}
        <header style={{ 
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              color: '#000000',
              fontSize: '2.25rem',
              fontWeight: 600,
              lineHeight: 1.25,
              letterSpacing: '-0.033em',
              marginBottom: '0.5rem',
            }}>
              Check-in/Check-out Request
            </h1>
            <p style={{
              color: '#191919ff',
              fontSize: '1rem',
              fontWeight: 400,
              marginBottom: '2rem'
            }}>
              Please fill out the form below to submit your request.
            </p>
            
            {/* View My Requests Button */}
            <button
              type="button"
              onClick={scrollToHistory}
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
        </header>

        {/* Error Alert */}
        {errors.general && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Form Section */}
        <div style={{
          ...cardStyle,
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '2rem' }}>
              {/* Student Information Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  color: '#000000',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem'
                }}>
                  Student Information
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '1.5rem'
                }}>
                  {/* Student Name */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#000000',
                      marginBottom: '0.5rem'
                    }}>
                      Student Name
                    </label>
                    <input
                      type="text"
                      value={studentData.name}
                      readOnly
                      style={{
                        width: '100%',
                        borderRadius: '0.375rem',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#f9fafb',
                        padding: '0.625rem',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}
                    />
                  </div>

                  {/* Student ID */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#000000',
                      marginBottom: '0.5rem'
                    }}>
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={studentData.id}
                      readOnly
                      style={{
                        width: '100%',
                        borderRadius: '0.375rem',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#f9fafb',
                        padding: '0.625rem',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}
                    />
                  </div>

                  {/* Room Number */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#000000',
                      marginBottom: '0.5rem'
                    }}>
                      Room Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#CD853F',
                        fontSize: '1rem'
                      }}>
                        <FontAwesomeIcon icon={faDoorOpen} />
                      </span>
                      <input
                        type="text"
                        value={studentData.roomNumber}
                        readOnly
                        style={{
                          width: '100%',
                          borderRadius: '0.375rem',
                          border: '1px solid #d1d5db',
                          backgroundColor: '#f9fafb',
                          padding: '0.625rem 0.625rem 0.625rem 2.5rem',
                          fontSize: '0.875rem',
                          color: '#6b7280'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Type Section */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#000000',
                  marginBottom: '1rem'
                }}>
                  Request Type
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem'
                }}>
                  {/* Check-in Option */}
                  <div>
                    <input
                      type="radio"
                      id="check-in"
                      name="requestType"
                      value="check-in"
                      checked={formData.requestType === 'check-in'}
                      onChange={handleInputChange}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="check-in"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '1rem',
                        borderRadius: '0.375rem',
                        border: `2px solid ${formData.requestType === 'check-in' ? '#7d2923' : '#d1d5db'}`,
                        backgroundColor: formData.requestType === 'check-in' ? '#7d2923' : 'white',
                        color: formData.requestType === 'check-in' ? 'white' : '#6b7280',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        fontWeight: '500'
                      }}
                    >
                      Check-in
                    </label>
                  </div>

                  {/* Check-out Option */}
                  <div>
                    <input
                      type="radio"
                      id="check-out"
                      name="requestType"
                      value="check-out"
                      checked={formData.requestType === 'check-out'}
                      onChange={handleInputChange}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="check-out"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '1rem',
                        borderRadius: '0.375rem',
                        border: `2px solid ${formData.requestType === 'check-out' ? '#7d2923' : '#d1d5db'}`,
                        backgroundColor: formData.requestType === 'check-out' ? '#7d2923' : 'white',
                        color: formData.requestType === 'check-out' ? 'white' : '#6b7280',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        fontWeight: '500'
                      }}
                    >
                      Check-out
                    </label>
                  </div>
                </div>
              </div>

              {/* Date Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#000000',
                    marginBottom: '0.5rem'
                  }}>
                    Requested Date
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#CD853F',
                      fontSize: '1rem'
                    }}>
                      <FontAwesomeIcon icon={faCalendar} />
                    </span>
                    <input
                      type="date"
                      name="requestDate"
                      value={formData.requestDate}
                      onChange={handleInputChange}
                      min={getTodayDate()}
                      required
                      style={{
                        width: '100%',
                        borderRadius: '0.375rem',
                        border: (errors.date || errors.duplicate) ? '1px solid #dc2626' : '1px solid #d1d5db',
                        backgroundColor: 'white',
                        padding: '0.625rem 0.625rem 0.625rem 2.5rem',
                        fontSize: '0.875rem',
                        color: '#1f2937'
                      }}
                    />
                  </div>
                  {errors.date && (
                    <div style={errorStyle}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>{errors.date}</span>
                    </div>
                  )}
                  {errors.duplicate && (
                    <div style={errorStyle}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>{errors.duplicate}</span>
                    </div>
                  )}
                  <div style={infoStyle}>
                    Select today or a future date
                  </div>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: errors.confirmation ? '1rem' : '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '1.25rem'
                }}>
                  <input
                    type="checkbox"
                    id="confirmation"
                    name="confirmation"
                    checked={formData.confirmation}
                    onChange={handleInputChange}
                    style={{
                      height: '1rem',
                      width: '1rem',
                      color: '#7d2923',
                      borderColor: errors.confirmation ? '#dc2626' : '#d1d5db',
                      borderRadius: '0.25rem'
                    }}
                  />
                </div>
                <div style={{ marginLeft: '0.75rem' }}>
                  <label
                    htmlFor="confirmation"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#000000',
                      cursor: 'pointer'
                    }}
                  >
                    I confirm that all information provided is accurate.
                  </label>
                  {errors.confirmation && (
                    <div style={errorStyle}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>{errors.confirmation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{
              paddingTop: '1.5rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#f3f4f6',
                  color: '#7d2923',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid transparent',
                  backgroundColor: submitting ? '#9ca3af' : '#7d2923',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!submitting) e.target.style.backgroundColor = '#69301cff';
                }}
                onMouseLeave={(e) => {
                  if (!submitting) e.target.style.backgroundColor = '#7d2923';
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Check-in/Out History Section */}
        <div 
          id="history-section"
          ref={historySectionRef}
          style={{
            ...cardStyle,
            padding: '2rem'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <FontAwesomeIcon 
                icon={faHistory} 
                style={{ 
                  color: '#7d2923', 
                  fontSize: '1.5rem',
                  marginRight: '0.75rem'
                }} 
              />
              <h2 style={{
                color: '#000000',
                fontSize: '1.5rem',
                fontWeight: 600
              }}>
                Request History
              </h2>
            </div>

            {/* Status Filter */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {historyLoading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '2rem' 
            }}>
              <div style={{
                animation: 'spin 1s linear infinite',
                borderRadius: '9999px',
                height: '2rem',
                width: '2rem',
                border: '2px solid #8d6e63',
                borderTopColor: 'transparent',
              }}></div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#6b7280'
            }}>
              <FontAwesomeIcon 
                icon={faHistory} 
                style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  color: '#d1d5db'
                }} 
              />
              <p style={{ fontSize: '1rem', fontWeight: '500' }}>
                No {statusFilter !== 'all' ? statusFilter : ''} requests found
              </p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {statusFilter === 'all' 
                  ? 'Your check-in and check-out requests will appear here once submitted.'
                  : `No ${statusFilter} requests found.`
                }
              </p>
            </div>
          ) : (
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              paddingRight: '0.5rem'
            }}>
              {filteredHistory.map((request, index) => (
                <div
                  key={request.id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.375rem',
                      backgroundColor: request.type?.toLowerCase().includes('check-in') ? '#d1fae5' : '#fef3c7'
                    }}>
                      <FontAwesomeIcon 
                        icon={request.type?.toLowerCase().includes('check-in') ? faDoorOpen : faCircleCheck} 
                        style={{ 
                          color: request.type?.toLowerCase().includes('check-in') ? '#065f46' : '#92400e',
                          fontSize: '1.25rem'
                        }} 
                      />
                    </div>
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.25rem'
                      }}>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#000000'
                        }}>
                          {request.type || 'Check-in/Out'}
                        </span>
                        <FontAwesomeIcon 
                          icon={getStatusIcon(request.status)} 
                          style={{ 
                            color: getStatusIconColor(request.status),
                            fontSize: '0.875rem'
                          }} 
                        />
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        {formatDate(request.date)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={getStatusBadge(request.status)}>
                    {request.status || 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

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
  );
};

export default CheckInOutPage;