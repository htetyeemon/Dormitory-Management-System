import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../service/api';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faCircleCheck, faDoorOpen, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

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
  const [errors, setErrors] = useState({
    duplicate: '',
    date: '',
    chronological: '',
    general: ''
  });

  useEffect(() => {
    fetchStudentData();
    fetchExistingRequests();
  }, [studentId]);

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

  const checkForDuplicateRequest = (type, date) => {
    return existingRequests.some(request => 
      request.date === date && 
      request.status === 'PENDING'
    );
  };

  const getLatestRequestDate = () => {
    if (existingRequests.length === 0) return null;
    
    // Sort requests by date in descending order and get the latest one
    const sortedRequests = [...existingRequests].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    return sortedRequests[0].date;
  };

  const validateChronologicalOrder = (date) => {
    const latestRequestDate = getLatestRequestDate();
    
    if (!latestRequestDate) return { isValid: true, message: '' };
    
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const latestDate = new Date(latestRequestDate);
    latestDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < latestDate) {
      return { 
        isValid: false, 
        message: `Date cannot be earlier than your last submitted request (${latestRequestDate}). Please select ${latestRequestDate} or a later date.` 
      };
    }
    
    return { isValid: true, message: '' };
  };

  const validateDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    oneWeekFromNow.setHours(23, 59, 59, 999);
    
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return { isValid: false, message: 'Date cannot be in the past. Please select today or a future date.' };
    }
    
    if (selectedDate > oneWeekFromNow) {
      return { isValid: false, message: 'Date cannot be more than one week in advance. Please select a date within the next 7 days.' };
    }
    
    return { isValid: true, message: '' };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear errors when user starts typing
    if (name === 'requestDate') {
      setErrors(prev => ({ ...prev, date: '', chronological: '' }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({ duplicate: '', date: '', chronological: '', general: '' });

    // Validate confirmation
    if (!formData.confirmation) {
      alert('Please confirm that all information provided is accurate.');
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

    // Validate chronological order
    const chronologicalValidation = validateChronologicalOrder(formData.requestDate);
    if (!chronologicalValidation.isValid) {
      setErrors(prev => ({ ...prev, chronological: chronologicalValidation.message }));
      return;
    }

    // Check for duplicate request (any type for the same date)
    const backendType = formData.requestType === 'check-in' ? 'Check-in' : 'Check-out';
    if (checkForDuplicateRequest(backendType, formData.requestDate)) {
      setErrors(prev => ({ 
        ...prev, 
        duplicate: `You already have a pending request for ${formData.requestDate}. Please wait for it to be processed or choose a different date.` 
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
      
      alert(`${formData.requestType === 'check-in' ? 'Check-in' : 'Check-out'} request submitted successfully!`);
      
      // Reset form
      setFormData({
        requestType: 'check-in',
        requestDate: '',
        confirmation: false
      });
      
      // Refresh existing requests to include the new one
      await fetchExistingRequests();
      
      // Optionally navigate to dashboard or history page
      // navigate(`/student/${studentId}/dashboard`);
      
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

  // Get today's date in YYYY-MM-DD format for the date input
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get max date (one week from today)
  const getMaxDate = () => {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    return oneWeekFromNow.toISOString().split('T')[0];
  };

  // Get min date based on latest existing request
  const getMinDate = () => {
    const latestRequestDate = getLatestRequestDate();
    const today = getTodayDate();
    
    if (!latestRequestDate) return today;
    
    // Return the later date between today and the latest request date
    return new Date(latestRequestDate) >= new Date(today) ? latestRequestDate : today;
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

  const latestRequestDate = getLatestRequestDate();
  const minDate = getMinDate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#faf7f5',
      fontFamily: 'Inter, sans-serif'
    }}>
      <main style={{
        maxWidth: '56rem',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Header Section */}
        <header style={{ marginBottom: '2rem' }}>
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
          }}>
            Please fill out the form below to submit your request. {latestRequestDate && `Your next request must be on or after ${latestRequestDate}.`}
          </p>
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
          padding: '2rem'
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
                      min={minDate}
                      max={getMaxDate()}
                      required
                      style={{
                        width: '100%',
                        borderRadius: '0.375rem',
                        border: (errors.date || errors.chronological) ? '1px solid #dc2626' : '1px solid #d1d5db',
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
                  {errors.chronological && (
                    <div style={errorStyle}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>{errors.chronological}</span>
                    </div>
                  )}
                  {errors.duplicate && (
                    <div style={errorStyle}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>{errors.duplicate}</span>
                    </div>
                  )}
                  <div style={infoStyle}>
                    {latestRequestDate 
                      ? `Select a date between ${getMaxDate()} and ${minDate}`
                      : `Select a date between today and ${getMaxDate()}`
                    }
                  </div>
                  {latestRequestDate && (
                    <div style={{
                      ...infoStyle,
                      color: '#7d2923',
                      fontStyle: 'italic'
                    }}>
                      Your last submitted request was for {latestRequestDate}
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '2rem'
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
                      borderColor: '#d1d5db',
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
      </main>
    </div>
  );
};

export default CheckInOutPage;