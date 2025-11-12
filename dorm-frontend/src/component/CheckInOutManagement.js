import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { managerAPI } from '../service/api';
import { useParams } from 'react-router-dom';

const CheckInOutManagement = () => {
  const { user } = useAuth();
  const { managerId } = useParams();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchCheckInOutRequests();
  }, [managerId]);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, requests]);

  const fetchCheckInOutRequests = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getAllCheckInOutRequests(managerId || user.id);
      setRequests(response.data || []);
    } catch (err) {
      console.error('Error fetching check-in/out requests:', err);
      // Fallback to sample data if API fails
      setRequests([
        {
          id: 1,
          student: { name: 'John Doe', room: { roomNum: '101' } },
          type: 'CHECKIN',
          date: '2023-10-27',
          status: 'PENDING'
        },
        {
          id: 2,
          student: { name: 'Jane Smith', room: { roomNum: '205' } },
          type: 'CHECKOUT',
          date: '2023-10-26',
          status: 'APPROVED'
        },
        {
          id: 3,
          student: { name: 'Peter Jones', room: { roomNum: '302' } },
          type: 'CHECKIN',
          date: '2023-10-25',
          status: 'REJECTED'
        },
        {
          id: 4,
          student: { name: 'Mary Johnson', room: { roomNum: '110' } },
          type: 'CHECKIN',
          date: '2023-10-24',
          status: 'PENDING'
        },
        {
          id: 5,
          student: { name: 'David Brown', room: { roomNum: '401' } },
          type: 'CHECKOUT',
          date: '2023-10-23',
          status: 'APPROVED'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (!searchTerm.trim()) {
      setFilteredRequests(requests);
      setCurrentPage(1);
      return;
    }

    const filtered = requests.filter(request => 
      request.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student?.room?.roomNum?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
    setCurrentPage(1);
  };

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(requestId);
      await managerAPI.approveCheckInOutRequest(managerId || user.id, requestId);
      await fetchCheckInOutRequests(); // Refresh the list
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionLoading(requestId);
      await managerAPI.rejectCheckInOutRequest(managerId || user.id, requestId);
      await fetchCheckInOutRequests(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'status-badge status-pending';
      case 'APPROVED':
        return 'status-badge status-approved';
      case 'REJECTED':
        return 'status-badge status-rejected';
      default:
        return 'status-badge status-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const getRequestTypeText = (type) => {
    return type === 'Check-in' ? 'Check-in' : 'Check-out';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="checkinout-management">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Check In/Out Management</h1>
        <p className="page-subtitle">Search by student name or room number</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-icon">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search by student name or room number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-section">
        <div className="table-container">
          <table className="requests-table">
            <thead className="table-header">
              <tr>
                <th className="table-head">STUDENT NAME</th>
                <th className="table-head">ROOM NUMBER</th>
                <th className="table-head">REQUEST TYPE</th>
                <th className="table-head">DATE</th>
                <th className="table-head">STATUS</th>
                <th className="table-head">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {currentItems.length > 0 ? (
                currentItems.map((request) => (
                  <tr key={request.id} className="table-row">
                    <td className="table-cell student-name">
                      {request.studentName}
                    </td>
                    <td className="table-cell room-number">
                      {request.roomNum}
                    </td>
                    <td className="table-cell request-type">
                      {getRequestTypeText(request.type)}
                    </td>
                    <td className="table-cell date">
                      {formatDate(request.date)}
                    </td>
                    <td className="table-cell status">
                      <span className={getStatusBadge(request.status)}>
                        {request.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="table-cell actions">
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={request.status !== 'PENDING' || actionLoading === request.id}
                        className="btn-approve"
                      >
                        {actionLoading === request.id ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={request.status !== 'PENDING' || actionLoading === request.id}
                        className="btn-reject"
                      >
                        {actionLoading === request.id ? '...' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="table-row">
                  <td colSpan="6" className="table-cell no-data">
                    {searchTerm ? 'No matching requests found.' : 'No check-in/out requests available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn pagination-prev"
            >
              Previous
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`pagination-btn pagination-number ${
                    currentPage === page ? 'pagination-active' : ''
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn pagination-next"
            >
              Next
            </button>
          </div>
        )}

        {/* Results count */}
        <div className="results-count">
          Showing {currentItems.length} of {filteredRequests.length} results
        </div>
      </div>

      <style jsx>{`
        .checkinout-management {
          min-height: 100vh;
          background-color: #f6f7f8;
          font-family: 'Inter', sans-serif;
          padding: 24px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 36px;
          font-weight: 900;
          color: #111827;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .search-section {
          margin-bottom: 24px;
        }

        .search-container {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          max-width: 400px;
          height: 48px;
          overflow: hidden;
        }

        .search-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          color: #6b7280;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 12px 12px 12px 0;
          font-size: 14px;
          color: #111827;
          background: transparent;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .table-section {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .table-container {
          overflow-x: auto;
        }

        .requests-table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-head {
          padding: 16px 24px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-body {
          background-color: white;
        }

        .table-row {
          border-bottom: 1px solid #e5e7eb;
          transition: background-color 0.2s;
        }

        .table-row:hover {
          background-color: #f9fafb;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-cell {
          padding: 16px 24px;
          font-size: 14px;
          color: #374151;
        }

        .student-name {
          font-weight: 600;
          color: #111827;
        }

        .room-number,
        .request-type,
        .date {
          color: #6b7280;
        }

        .status {
          font-size: 12px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 9999px;
          font-weight: 500;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-pending {
          background-color: #fef3c7;
          color: #d97706;
        }

        .status-approved {
          background-color: #d1fae5;
          color: #065f46;
        }

        .status-rejected {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .btn-approve,
        .btn-reject {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 70px;
        }

        .btn-approve {
          background-color: #10b981;
          color: white;
        }

        .btn-approve:hover:not(:disabled) {
          background-color: #059669;
        }

        .btn-reject {
          background-color: #ef4444;
          color: white;
        }

        .btn-reject:hover:not(:disabled) {
          background-color: #dc2626;
        }

        .btn-approve:disabled,
        .btn-reject:disabled {
          background-color: #d1d5db;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .no-data {
          text-align: center;
          color: #6b7280;
          font-style: italic;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .pagination-btn {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-numbers {
          display: flex;
          gap: 4px;
        }

        .pagination-number {
          min-width: 40px;
        }

        .pagination-active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .pagination-active:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        .results-count {
          text-align: center;
          padding: 16px;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #f3f4f6;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-left: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-size: 20px;
        }
      `}</style>
    </div>
  );
};

export default CheckInOutManagement;