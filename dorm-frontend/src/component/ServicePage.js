import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../service/api';
import { useParams } from 'react-router-dom';
import '../css/ServicePage.css';

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

  useEffect(() => {
    fetchServiceRequests();
    fetchRoomInfo();
  }, [studentId]);

  useEffect(() => {
    filterRequests();
  }, [serviceRequests, searchTerm]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getServiceHistory(studentId);
      setServiceRequests(response.data || []);
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
        // Extract dormitory info from room data
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

    const filtered = serviceRequests.filter(request =>
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
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
    // If there's existing time, parse it for the time picker
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'status-badge status-pending',
      'APPROVED': 'status-badge status-completed'
    };

    const className = statusClasses[status] || statusClasses['Pending'];
    const label = status || 'Pending';

    return <span className={className}>{label}</span>;
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
    <div className="service-page">
      <div className="service-container">
        {/* Header */}
        <div className="service-header">
          <h1 className="service-title">Service Request Dashboard</h1>
          <p className="service-subtitle">Submit and track your maintenance and service requests</p>
        </div>

        <div className="service-grid">
          {/* Left Column - Submit Form */}
          <div className="form-column">
            <div className="service-card form-card">
              <div className="card-header">
                <h2 className="card-title">Submit Service Request</h2>
                <p className="card-subtitle">Please fill out the form below to submit a service request.</p>
              </div>

              <form onSubmit={handleSubmit} className="service-form">
                {/* Service Type */}
                <div className="form-group">
                  <label className="form-label">Service Type</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    required
                    className="form-select"
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

                {/* Priority Level - Full Width */}
                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <div className="radio-group-horizontal">
                    {['low', 'medium', 'high'].map(level => (
                      <label key={level} className="radio-label">
                        <input
                          type="radio"
                          name="priorityLvl"
                          value={level}
                          checked={formData.priorityLvl === level}
                          onChange={handleInputChange}
                          className="radio-input"
                        />
                        <span className="radio-text">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description of Issue</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Please provide a detailed description of the problem..."
                    className="form-textarea"
                  />
                </div>

                {/* Preferred Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Preferred Date</label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Time</label>
                    <div className="time-picker-container">
                      <div 
                        className="time-picker-input"
                        onClick={handleTimePickerToggle}
                      >
                        {formData.preferredTime ? (
                          `${formData.preferredTime} ${formData.timePeriod}`
                        ) : (
                          <span className="time-placeholder">Select time...</span>
                        )}
                        <span className="time-picker-arrow">▼</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="submit-button"
                >
                  {submitting ? 'Submitting...' : 'Submit Service Request'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div className="sidebar-column">
            {/* Contact Information */}
            <div className="service-card sidebar-card">
              <h3 className="card-title">Contact Information</h3>
              <div className="space-y-2">
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div className="contact-content">
                    <p className="contact-title">Dormitory Office Phone</p>
                    <p className="contact-detail">
                      {dormitoryInfo?.phoneNum || '(555) 123-4567'}
                    </p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">✉️</span>
                  <div className="contact-content">
                    <p className="contact-title">Maintenance Emergency Email</p>
                    <p className="contact-detail">
                      {dormitoryInfo?.email || 'support@dormservices.edu'}
                    </p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <div className="contact-content">
                    <p className="contact-title">Physical Address</p>
                    <p className="contact-detail">
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
                <div className="contact-item">
                  <span className="contact-icon">🚪</span>
                  <div className="contact-content">
                    <p className="contact-title">Your Room</p>
                    <p className="contact-detail">
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
            <div className="service-card sidebar-card">
              <h3 className="card-title">Service Hours</h3>
              <div className="space-y-3">
                <div className="hours-item">
                  <p className="hours-title">Emergency Services</p>
                  <p className="hours-time">24/7 Availability</p>
                </div>
                <div className="hours-item">
                  <p className="hours-title">General Maintenance</p>
                  <p className="hours-time">Mon-Fri, 9:00 AM–5:00 PM</p>
                </div>
                <div className="hours-item">
                  <p className="hours-title">Dormitory Office</p>
                  <p className="hours-time">Mon-Sat, 8:00 AM–8:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Service Requests Section */}
        <div className="requests-section">
          <div className="requests-header">
            <h2 className="requests-title">My Service Requests</h2>
            
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="requests-table-container">
              <div className="requests-table-wrapper">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Description</th>
                      <th>Service Type</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayFilteredRequests.map((request, index) => (
                      <tr key={request.id || index}>
                        <td className="font-mono">#{request.id}</td>
                        <td className="description-cell" title={request.description}>
                          {truncateDescription(request.description)}
                        </td>
                        <td>{request.serviceType}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{formatDate(request.date || request.dateTime)}</td>
                        <td className="text-right">
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="action-button"
                            title="View Details"
                          >
                            👁️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {displayFilteredRequests.length === 0 && (
                  <div className="empty-state">
                    {searchTerm ? 'No service requests found matching your search.' : 'No service requests available.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Picker Dialog */}
      {showTimePicker && (
        <div className="time-picker-overlay" onClick={cancelTime}>
          <div className="time-picker-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="time-picker-header">
              <h3 className="time-picker-title">Select Time</h3>
              <button onClick={cancelTime} className="time-picker-close">
                ✕
              </button>
            </div>
            
            <div className="time-picker-body">
              <div className="time-picker-columns">
                <div className="time-picker-column">
                  <div className="time-picker-label">Hour</div>
                  <div className="time-picker-scroll">
                    {generateHours().map(hour => (
                      <div
                        key={hour}
                        className={`time-picker-item ${timePickerState.hour === hour ? 'selected' : ''}`}
                        onClick={() => handleTimeChange('hour', hour)}
                      >
                        {hour}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="time-picker-column">
                  <div className="time-picker-label">Minute</div>
                  <div className="time-picker-scroll">
                    {generateMinutes().map(minute => (
                      <div
                        key={minute}
                        className={`time-picker-item ${timePickerState.minute === minute ? 'selected' : ''}`}
                        onClick={() => handleTimeChange('minute', minute)}
                      >
                        {minute}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="time-picker-column">
                  <div className="time-picker-label">Period</div>
                  <div className="time-picker-scroll">
                    {['AM', 'PM'].map(period => (
                      <div
                        key={period}
                        className={`time-picker-item ${timePickerState.period === period ? 'selected' : ''}`}
                        onClick={() => handleTimeChange('period', period)}
                      >
                        {period}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="time-picker-footer">
              <button onClick={cancelTime} className="time-picker-button cancel">
                Cancel
              </button>
              <button onClick={confirmTime} className="time-picker-button confirm">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Request Details</h3>
              <button onClick={closeModal} className="modal-close">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-grid">
                <div>
                  <label className="modal-label">Request ID</label>
                  <p className="modal-value font-mono">#{selectedRequest.id}</p>
                </div>
                <div>
                  <label className="modal-label">Status</label>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <label className="modal-label">Service Type</label>
                  <p className="modal-value">{selectedRequest.serviceType}</p>
                </div>
                <div>
                  <label className="modal-label">Priority</label>
                  <p className="modal-value capitalize">{selectedRequest.priorityLvl || 'Not specified'}</p>
                </div>
              </div>

              <div className="modal-section">
                <label className="modal-label">Description</label>
                <p className="modal-description">{selectedRequest.description}</p>
              </div>

              <div className="modal-grid">
                <div>
                  <label className="modal-label">Submitted Date</label>
                  <p className="modal-value">{formatDate(selectedRequest.date || selectedRequest.dateTime)}</p>
                </div>
                <div>
                  <label className="modal-label">Room Number</label>
                  <p className="modal-value">
                    {roomInfo?.room ? `Room ${roomInfo.room.roomNum}` : 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="modal-button">
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