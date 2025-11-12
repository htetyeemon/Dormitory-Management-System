import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { managerAPI } from '../service/api';
import { useParams } from 'react-router-dom';
import '../css/ComplaintsPage.css';

const ComplaintsPage = () => {
  const { user } = useAuth();
  const { managerId } = useParams();
  
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

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
        if (statusFilter === 'in_progress') return complaint.status === 'IN_PROGRESS';
        if (statusFilter === 'resolved') return complaint.status === 'RESOLVED';
        return true;
      });
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    setTotalPages(totalPages);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedComplaints = filtered.slice(startIndex, endIndex);

    setFilteredComplaints(paginatedComplaints);
  };

  // ✅ Fixed Approve button logic
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

  // ✅ Fixed Resolve button logic
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'Pending', class: 'status-pending' },
      'IN PROGRESS': { label: 'In Progress', class: 'status-in-progress' },
      'RESOLVED': { label: 'Resolved', class: 'status-resolved' }
    };

    const statusInfo = statusMap[status] || statusMap['PENDING'];
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'HIGH': { label: 'High', class: 'priority-high' },
      'MEDIUM': { label: 'Medium', class: 'priority-medium' },
      'LOW': { label: 'Low', class: 'priority-low' },
      'URGENT': { label: 'Urgent', class: 'priority-urgent' }
    };

    const priorityInfo = priorityMap[priority] || { label: priority, class: 'priority-default' };
    return <span className={`priority-badge ${priorityInfo.class}`}>{priorityInfo.label}</span>;
  };

  const formatComplaintId = (id) => id;
  const formatStudentId = (id) => (id === 'N/A' ? 'N/A' : id);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <button key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn pagination-prev">
        ‹
      </button>
    );

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => handlePageChange(1)} className="pagination-btn">
          1
        </button>
      );
      if (startPage > 2) pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button key={i} onClick={() => handlePageChange(i)} className={`pagination-btn ${currentPage === i ? 'pagination-active' : ''}`}>
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      pages.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)} className="pagination-btn">
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn pagination-next">
        ›
      </button>
    );

    return <div className="pagination-container">{pages}</div>;
  };

  const getSampleData = () => [
    { id: 123, description: "Leaky faucet in bathroom", status: "PENDING", priorityLv1: "HIGH", serviceType: "PLUMBING", student: { id: 1023, name: "John Doe", room: { roomNum: "201B" } } },
    { id: 124, description: "Wi-Fi not working", status: "IN_PROGRESS", priorityLv1: "MEDIUM", serviceType: "NETWORK", student: { id: 1024, name: "Jane Smith", room: { roomNum: "305A" } } },
    { id: 125, description: "Heater broken", status: "IN_PROGRESS", priorityLv1: "HIGH", serviceType: "HVAC", student: { id: 1025, name: "Mike Ross", room: { roomNum: "105A" } } },
    { id: 126, description: "Lost keycard", status: "RESOLVED", priorityLv1: "URGENT", serviceType: "SECURITY", student: { id: 1026, name: "Rachel Zane", room: { roomNum: "412C" } } },
    { id: 127, description: "Desk drawer stuck", status: "PENDING", priorityLv1: "LOW", serviceType: "FURNITURE", student: { id: 1027, name: "Alex Kim", room: { roomNum: "208D" } } }
  ];

  const renderActionButtons = (complaint) => {
    return (
      <div className="actions-buttons">
        {complaint.status === 'PENDING' && (
          <>
            <button
              onClick={() => handleApprove(complaint.id)}
              disabled={updating === complaint.id}
              className="btn-approve"
            >
              {updating === complaint.id ? 'Updating...' : 'Approve'}
            </button>
            <button disabled className="btn-resolve btn-disabled">Resolve</button>
          </>
        )}

        {complaint.status === 'IN PROGRESS' && (
          <>
            <button disabled className="btn-approve btn-disabled">Approved</button>
            <button
              onClick={() => handleResolve(complaint.id)}
              disabled={updating === complaint.id}
              className="btn-resolve"
            >
              {updating === complaint.id ? 'Updating...' : 'Resolve'}
            </button>
          </>
        )}

        {complaint.status === 'RESOLVED' && (
          <>
            <button disabled className="btn-approve btn-disabled">Approved</button>
            <button disabled className="btn-resolve btn-disabled">Resolved</button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="complaints-page">
      <div className="complaints-container">
        <div className="complaints-header">
          <div className="header-content">
            <h1 className="page-title">Complaints Management</h1>
            <p className="page-subtitle">Manage and track student complaints and repair requests</p>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search complaints..." value={searchTerm} onChange={handleSearch} className="search-input" />
          </div>
          <div className="filter-controls">
            <select value={statusFilter} onChange={handleStatusFilter} className="status-filter">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading complaints...</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="complaints-table">
                  <thead>
                    <tr>
                      <th>Complaint ID</th>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Room Number</th>
                      <th className="complaint-type-header">Complaint Type</th>
                      <th className="issue-description-header">Issue Description</th>
                      <th>Priority Level</th>
                      <th>Status</th>
                      <th className="actions-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredComplaints.length > 0 ? filteredComplaints : getSampleData()).map((complaint) => {
                      const { studentName, studentId, roomNumber, priorityLevel, complaintType } = getComplaintInfo(complaint);
                      return (
                        <tr key={complaint.id}>
                          <td className="complaint-id">{formatComplaintId(complaint.id)}</td>
                          <td className="student-name">{studentName}</td>
                          <td className="student-id">{formatStudentId(studentId)}</td>
                          <td className="room-number">{roomNumber}</td>
                          <td className="complaint-type">{complaintType}</td>
                          <td className="issue-description">{complaint.description}</td>
                          <td className="priority-level">{getPriorityBadge(priorityLevel)}</td>
                          <td className="status-cell">{getStatusBadge(complaint.status)}</td>
                          <td className="actions-cell">{renderActionButtons(complaint)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination-section">
                  {renderPagination()}
                  <div className="pagination-info">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, complaints.length)} of {complaints.length} complaints
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPage;