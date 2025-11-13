import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { managerAPI } from '../service/api';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch,faWrench, faSort, faTimes} from '@fortawesome/free-solid-svg-icons';

const ComplaintsPage = () => {
  const { user } = useAuth();
  const { managerId } = useParams();
  
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [expandedViewModal, setExpandedViewModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    fetchComplaints();
  }, [managerId]);

  useEffect(() => {
    filterAndPaginateComplaints();
  }, [complaints, searchTerm, statusFilter, currentPage]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getAllComplaints(managerId);
      const complaintsData = response.data || [];
      console.log('Complaints data:', complaintsData);
      setComplaints(complaintsData);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const getComplaintInfo = (complaint) => {
    let studentName = 'N/A';
    let studentId = 'N/A';
    let roomNumber = 'N/A';
    let priorityLevel = 'N/A';
    let complaintType = 'N/A';

    if (complaint) {
      studentName = complaint.studentName || complaint.student?.studentName || 'N/A';
      studentId = complaint.studentId || complaint.student?.studentId || 'N/A';
      if (complaint.roomNumber || complaint.student?.room?.roomNumber) {
        roomNumber = complaint.roomNumber || complaint.student.room.roomNumber;
      }
      priorityLevel = complaint.priorityLvl|| complaint.priorityLevel || 'N/A';
      complaintType = complaint.type || complaint.complaintType || 'N/A';
    }

    return { studentName, studentId, roomNumber, priorityLevel, complaintType };
  };

  const filterAndPaginateComplaints = () => {
    let filtered = complaints;

    if (searchTerm) {
      filtered = filtered.filter(complaint => {
        const { studentName, studentId, roomNumber, priorityLevel, complaintType } = getComplaintInfo(complaint);
        return (
          complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          studentId?.toString().includes(searchTerm) ||
          roomNumber?.toString().includes(searchTerm) ||
          complaint.id?.toString().includes(searchTerm) ||
          priorityLevel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaintType?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => {
        if (statusFilter === 'pending') return complaint.status === 'PENDING';
        if (statusFilter === 'in_progress') return complaint.status === 'IN PROGRESS';
        if (statusFilter === 'resolved') return complaint.status === 'RESOLVED';
        return true;
      });
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedComplaints = filtered.slice(startIndex, endIndex);

    setFilteredComplaints(paginatedComplaints);
  };

  const handleApprove = async (complaintId) => {
    try {
      setUpdating(complaintId);
      setComplaints(prev =>
        prev.map(c =>
          c.id === complaintId ? { ...c, status: 'IN PROGRESS' } : c
        )
      );
      await managerAPI.updateComplaintStatus(managerId, complaintId,'IN PROGRESS');
    } catch (err) {
      console.error('Error approving complaint:', err);
      alert('Failed to approve complaint.');
      setComplaints(prev =>
        prev.map(c =>
          c.id === complaintId ? { ...c, status: 'PENDING' } : c
        )
      );
    } finally {
      setUpdating(null);
    }
  };

  const handleResolve = async (complaintId) => {
    try {
      setUpdating(complaintId);
      setComplaints(prev =>
        prev.map(c =>
          c.id === complaintId ? { ...c, status: 'RESOLVED' } : c
        )
      );
      await managerAPI.updateComplaintStatus(managerId, complaintId,'RESOLVED');
    } catch (err) {
      console.error('Error resolving complaint:', err);
      alert('Failed to resolve complaint.');
      setComplaints(prev =>
        prev.map(c =>
          c.id === complaintId ? { ...c, status: 'IN PROGRESS' } : c
        )
      );
    } finally {
      setUpdating(null);
    }
  };

  const handleView = (complaint) => {
    setViewingComplaint(complaint);
    setExpandedViewModal(false);
    setShowViewModal(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleViewModalReadMore = () => {
    setExpandedViewModal(!expandedViewModal);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { 
        label: 'PENDING', 
        backgroundColor: '#fff3cd',
        color: '#856404',
        borderColor: '#ffeaa7'
      },
      'IN PROGRESS': { 
        label: 'IN PROGRESS', 
        backgroundColor: '#cce7ff',
        color: '#004085',
        borderColor: '#b3d7ff'
      },
      'RESOLVED': { 
        label:'RESOLVED', 
        backgroundColor: '#d4edda',
        color: '#155724',
        borderColor: '#c3e6cb'
      }
    };

    const statusInfo = statusMap[status] || statusMap['PENDING'];
    return (
      <span 
        className="status-badge"
        style={{
          backgroundColor: statusInfo.backgroundColor,
          color: statusInfo.color,
          border: `1px solid ${statusInfo.borderColor}`,
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {statusInfo.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'high': { 
        label: 'HIGH', 
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        borderColor: '#fecaca'
      },
      'medium': { 
        label: 'MEDIUM', 
        backgroundColor: '#fef3c7',
        color: '#d97706',
        borderColor: '#fde68a'
      },
      'low': { 
        label: 'LOW', 
        backgroundColor: '#d1fae5',
        color: '#059669',
        borderColor: '#a7f3d0'
      }
    };

    const priorityInfo = priorityMap[priority] || { 
      label: priority, 
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      borderColor: '#e5e7eb'
    };
    
    return (
      <span 
        className="priority-badge"
        style={{
          backgroundColor: priorityInfo.backgroundColor,
          color: priorityInfo.color,
          border: `1px solid ${priorityInfo.borderColor}`,
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {priorityInfo.label}
      </span>
    );
  };

  const formatStudentId = (id) => (id === 'N/A' ? 'N/A' : id);

  const needsReadMore = (description) => {
    return description && description.length > 100;
  };

  // Card style matching announcement page
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e8c8b5ff',
    padding: '1.5rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  };

  // Modal styles matching announcement page
  const modalBackdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '90vw',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const modalHeaderStyle = {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa'
  };

  const modalBodyStyle = {
    padding: '1.5rem',
    flex: 1,
    overflow: 'auto'
  };

  const modalFooterStyle = {
    padding: '1.5rem',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    backgroundColor: '#fafafa'
  };

  // Filter and pagination calculations
  const filteredComplaintsAll = complaints.filter(complaint => {
    const { studentName, studentId, roomNumber, priorityLevel, complaintType } = getComplaintInfo(complaint);
    
    if (searchTerm) {
      const matchesSearch = 
        complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentId?.toString().includes(searchTerm) ||
        roomNumber?.toString().includes(searchTerm) ||
        complaint.id?.toString().includes(searchTerm) ||
        priorityLevel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaintType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && complaint.status !== 'PENDING') return false;
      if (statusFilter === 'in_progress' && complaint.status !== 'IN PROGRESS') return false;
      if (statusFilter === 'resolved' && complaint.status !== 'RESOLVED') return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredComplaintsAll.length / itemsPerPage);
  const indexOfLastComplaint = currentPage * itemsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - itemsPerPage;
  const currentComplaints = filteredComplaintsAll.slice(indexOfFirstComplaint, indexOfLastComplaint);

  // Generate page numbers to display (same as announcement page)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const getSampleData = () => [
    { id: 123, description: "Leaky faucet in bathroom that needs immediate attention before it causes water damage to the floor and surrounding areas", status: "PENDING", priorityLvl: "HIGH", type: "PLUMBING", student: { studentId: 1023, studentName: "John Doe", room: { roomNumber: "201B" } } },
    { id: 124, description: "Wi-Fi not working in room, cannot connect to any devices", status: "IN PROGRESS", priorityLvl: "MEDIUM", type: "NETWORK", student: { studentId: 1024, studentName: "Jane Smith", room: { roomNumber: "305A" } } },
    { id: 125, description: "Heater broken during winter, room temperature is very cold", status: "IN PROGRESS", priorityLvl: "HIGH", type: "HVAC", student: { studentId: 1025, studentName: "Mike Ross", room: { roomNumber: "105A" } } },
    { id: 126, description: "Lost keycard and cannot access room", status: "RESOLVED", priorityLvl: "URGENT", type: "SECURITY", student: { studentId: 1026, studentName: "Rachel Zane", room: { roomNumber: "412C" } } },
    { id: 127, description: "Desk drawer stuck and won't open properly", status: "PENDING", priorityLvl: "LOW", type: "FURNITURE", student: { studentId: 1027, studentName: "Alex Kim", room: { roomNumber: "208D" } } }
  ];

  const renderActionButtons = (complaint, e = null) => {
    if (e) e.stopPropagation();
    
    return (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {complaint.status === 'PENDING' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(complaint.id);
              }}
              disabled={updating === complaint.id}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.60rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: '#228B22',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px 0 rgba(59, 130, 246, 0.2)',
                fontFamily: 'inherit',
                minWidth: '100px',
                height: '2.25rem',
              }}
              onMouseEnter={(e) => {
                if (updating !== complaint.id) {
                  e.target.style.background = '#1C711C';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px 0 rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (updating !== complaint.id) {
                  e.target.style.background = '#228B22';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 1px 2px 0 rgba(59, 130, 246, 0.2)';
                }
              }}
            >
              {updating === complaint.id ? 'Updating...' : 'Approve'}
            </button>
            <button 
              disabled 
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.60rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: '#d1d5db',
                color: '#6b7280',
                border: 'none',
                cursor: 'not-allowed',
                fontFamily: 'inherit',
                minWidth: '100px',
                height: '2.25rem',
                opacity: 0.6
              }}
            >
              Resolve
            </button>
          </>
        )}

        {complaint.status === 'IN PROGRESS' && (
          <>
            <button 
              disabled 
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.60rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: '#d1d5db',
                color: '#6b7280',
                border: 'none',
                cursor: 'not-allowed',
                fontFamily: 'inherit',
                minWidth: '100px',
                height: '2.25rem',
                opacity: 0.6
              }}
            >
              Approved
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResolve(complaint.id);
              }}
              disabled={updating === complaint.id}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.60rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: '#d8392eff',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px 0 rgba(59, 130, 246, 0.2)',
                fontFamily: 'inherit',
                minWidth: '100px',
                height: '2.25rem',
              }}
              onMouseEnter={(e) => {
                if (updating !== complaint.id) {
                  e.target.style.background = '#b02a23';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px 0 rgba(239, 68, 68, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (updating !== complaint.id) {
                  e.target.style.background = '#d8392eff';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 1px 2px 0 rgba(59, 130, 246, 0.2)';
                }
              }}
            >
              {updating === complaint.id ? 'Updating...' : 'Resolve'}
            </button>
          </>
        )}

        {complaint.status === 'RESOLVED' && (
          <>
            <button 
              disabled 
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.60rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: '#d1d5db',
                color: '#6b7280',
                border: 'none',
                cursor: 'not-allowed',
                fontFamily: 'inherit',
                minWidth: '100px',
                height: '2.25rem',
                opacity: 0.6
              }}
            >
              Approved
            </button>
            <button 
              disabled 
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.60rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: '#d1d5db',
                color: '#6b7280',
                border: 'none',
                cursor: 'not-allowed',
                fontFamily: 'inherit',
                minWidth: '100px',
                height: '2.25rem',
                opacity: 0.6
              }}
            >
              Resolved
            </button>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '16rem',
        backgroundColor: '#faf7f5'
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
      padding: '2rem',
      backgroundColor: '#faf7f5',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <h1 style={{
              color: '#000000',
              fontSize: '2.25rem',
              fontWeight: 600,
              lineHeight: 1.25,
              letterSpacing: '-0.033em',
              marginBottom: '0.5rem',
            }}>
              Complaints Management
            </h1>
            <p style={{
              color: '#191919ff',
              fontSize: '1rem',
              fontWeight: 400,
              lineHeight: 'normal',
            }}>
              Manage and track student complaints and repair requests
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {/* Search Input */}
          <div style={{
            position: 'relative',
            flexGrow: 1,
            minWidth: '240px'
          }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#CD853F',
              fontSize: '16px'
            }}>
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                width: '100%',
                minWidth: '0',
                resize: 'none',
                overflow: 'hidden',
                borderRadius: '0.5rem',
                border: '1px solid #e8c8b5ff',
                backgroundColor: 'white',
                height: '3rem',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                fontSize: '1rem',
                fontWeight: 400,
                lineHeight: 'normal',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#7d2923'}
              onBlur={(e) => e.target.style.borderColor = '#e8c8b5ff'}
            />
          </div>

          {/* Status Filter */}
          <div style={{
            position: 'relative',
            minWidth: '192px'
          }}>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              style={{
                width: '100%',
                minWidth: '0',
                resize: 'none',
                overflow: 'hidden',
                borderRadius: '0.5rem',
                border: '1px solid #e8c8b5ff',
                backgroundColor: 'white',
                height: '3rem',
                paddingLeft: '1rem',
                paddingRight: '2.5rem',
                fontSize: '1rem',
                fontWeight: 400,
                lineHeight: 'normal',
                appearance: 'none',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#7d2923'}
              onBlur={(e) => e.target.style.borderColor = '#e8c8b5ff'}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#7d2923',
              fontSize: '14px',
              pointerEvents: 'none'
            }}>
              <FontAwesomeIcon icon={faSort} />
            </span>
          </div>
        </div>

        {/* Complaints List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {(currentComplaints.length > 0 ? currentComplaints : getSampleData()).map((complaint) => {
            const { studentName, studentId, roomNumber, priorityLevel, complaintType } = getComplaintInfo(complaint);
            const shouldShowReadMore = needsReadMore(complaint.description);

            return (
              <div
                key={complaint.id}
                style={{
                  ...cardStyle,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }}
                onClick={() => handleView(complaint)}
              >
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ color: '#CD853F', fontSize: '1.25rem' }}>
                      <FontAwesomeIcon icon={faWrench} />
                    </span>
                    <div>
                      <h3 style={{
                        color: '#000000',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        margin: 0,
                        marginBottom: '0.25rem'
                      }}>
                        {studentName} - Room {roomNumber}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        flexWrap: 'wrap'
                      }}>
                        
                        <span style={{
                          color: '#6b7280',
                          fontSize: '0.875rem',
                        }}>
                          Student ID: {formatStudentId(studentId)}
                        </span>
                        {getPriorityBadge(priorityLevel)}
                        {getStatusBadge(complaint.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem'
                  }}>
                    {/* Action Buttons */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      flexShrink: 0,
                    }}>
                      {renderActionButtons(complaint)}
                    </div>
                  </div>
                </div>

                {/* Issue Description */}
                <div style={{
                  color: '#191919ff',
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  <div
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      paddingLeft:'3rem'
                    }}
                  >
                    {complaint.description}
                  </div>
                  {shouldShowReadMore && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(complaint);
                      }}
                      style={{
                        color: '#806e6eff',
                        fontWeight: 500,
                        fontSize: '1rem',
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
                      Read More ?
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {currentComplaints.length === 0 && (
            <div style={{
              ...cardStyle,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '3rem',
              color: '#191919ff',
              fontSize: '1rem',
            }}>
              {searchTerm ? 'No complaints found matching your search.' : 'No complaints available.'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '1.5rem',
          }}>
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}>
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '0.5rem',
                  transition: 'background-color 0.2s',
                  border: '1px solid #e8c8b5ff',
                  backgroundColor: currentPage === 1 ? '#faf7f5' : 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.target.style.backgroundColor = '#faf7f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                ←
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e8c8b5ff',
                    backgroundColor: currentPage === page ? '#7d2923' : 'white',
                    color: currentPage === page ? 'white' : '#191919ff',
                    cursor: page === '...' ? 'default' : 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (page !== '...' && currentPage !== page) {
                      e.target.style.backgroundColor = '#faf7f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page !== '...' && currentPage !== page) {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '0.5rem',
                  transition: 'background-color 0.2s',
                  border: '1px solid #e8c8b5ff',
                  backgroundColor: currentPage === totalPages ? '#faf7f5' : 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.target.style.backgroundColor = '#faf7f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                →
              </button>
            </nav>
          </div>
        )}

        {/* View Complaint Modal */}
        {showViewModal && viewingComplaint && (
          <div style={modalBackdropStyle}>
            <div style={{
              ...modalContentStyle,
              maxWidth: '700px',
              width: '90vw'
            }}>
              <div style={modalHeaderStyle}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1f2937',
                  margin: 0,
                  paddingRight: '2rem',
                }}>
                  Complaint Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.25rem',
                    color: '#6b7280',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '0.375rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6b7280';
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div style={modalBodyStyle}>
                {/* Complaint Information */}
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}>
                    <div>
                      <strong style={{ color: '#374151' }}>Complaint ID:</strong>
                      <div style={{ color: '#6b7280' }}>{viewingComplaint.id}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Student Name:</strong>
                      <div style={{ color: '#6b7280' }}>{getComplaintInfo(viewingComplaint).studentName}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Student ID:</strong>
                      <div style={{ color: '#6b7280' }}>{formatStudentId(getComplaintInfo(viewingComplaint).studentId)}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Room Number:</strong>
                      <div style={{ color: '#6b7280' }}>{getComplaintInfo(viewingComplaint).roomNumber}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Complaint Type:</strong>
                      <div style={{ color: '#6b7280' }}>{getComplaintInfo(viewingComplaint).complaintType}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Priority Level:</strong>
                      <div>{getPriorityBadge(getComplaintInfo(viewingComplaint).priorityLevel)}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Status:</strong>
                      <div>{getStatusBadge(viewingComplaint.status)}</div>
                    </div>
                  </div>
                </div>

                {/* Issue Description */}
                <div style={{
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '1rem',
                  }}>
                    Issue Description
                  </h3>
                  <div style={{
                    position: 'relative',
                  }}>
                    <div
                      style={{
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        maxHeight: expandedViewModal ? 'none' : '200px',
                        transition: 'max-height 0.3s ease',
                        color: '#6b7280',
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      {viewingComplaint.description}
                    </div>
                    {needsReadMore(viewingComplaint.description) && (
                      <button
                        onClick={toggleViewModalReadMore}
                        style={{
                          color: '#806e6eff',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.5rem 0',
                          marginTop: '0.5rem',
                          alignSelf: 'flex-start',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {expandedViewModal ? (
                          <>
                            <span>Show Less</span>
                            <span>?</span>
                          </>
                        ) : (
                          <>
                            <span>Read More</span>
                            <span>?</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div style={modalFooterStyle}>
                <button
                  onClick={() => setShowViewModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Close
                </button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {renderActionButtons(viewingComplaint)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .complaints-container {
            padding: 1rem 0.5rem;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: auto;
          }

          .status-badge {
            font-size: 0.65rem;
            padding: 0.2rem 0.5rem;
          }

          .priority-badge {
            font-size: 0.65rem;
            padding: 0.2rem 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ComplaintsPage;