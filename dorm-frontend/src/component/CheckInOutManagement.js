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
      request.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.roomNum?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers to display
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
        
        {/* Add this search results info */}
        {searchTerm && (
          <div className="search-results-info">
            Found {filteredRequests.length} result{filteredRequests.length !== 1 ? 's' : ''} for "{searchTerm}"
            {filteredRequests.length === 0 && (
              <span style={{marginLeft: '10px', color: '#666'}}>
                Try searching by student name (e.g., "John") or room number (e.g., "101")
              </span>
            )}
          </div>
        )}
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

        {/* Pagination - Updated to match ManagerRooms style */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '1.5rem',
            paddingBottom: '1.5rem',
            borderTop: '1px solid #e5e7eb'
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
                onClick={handlePrevPage}
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
                  onClick={() => typeof page === 'number' && paginate(page)}
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
                onClick={handleNextPage}
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
      </div>

      <style jsx>{`
        .checkinout-management {
          min-height: 100vh;
          background-color: #faf7f5;
          font-family: 'Inter', sans-serif;
          padding: 2rem;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2.25rem;
          font-weight: 600;
          color: #000000;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.033em;
          line-height: 1.25;
        }

        .page-subtitle {
          font-size: 1rem;
          color: #191919ff;
          margin: 0;
          padding-left:rem;
          font-weight: 400;
        }

        .search-section {
          margin-bottom: 2rem;
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
          color: #CD853F;
          font-size: 16px;
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

        .search-input:focus {
          border-color: #7d2923;
        }

        .table-section {
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e8c8b5ff;
          overflow: hidden;
        }

        .table-container {
          overflow-x: auto;
        }

        .requests-table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-header {
          background-color: #faf7f5;
          border-bottom: 1px solid #e2d6cf;
        }

        .table-head {
          padding: 1rem;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2d6cf;
        }

        .table-body {
          background-color: white;
        }

        .table-row {
          border-bottom: 1px solid #e2d6cf;
          transition: background-color 0.2s;
        }

        .table-row:hover {
          background-color: #faf7f5;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-cell {
          padding: 1rem;
          font-size: 0.875rem;
          color: #191919ff;
        }

        .student-name {
          font-weight: 700;
          color: #000000;
        }

        .room-number,
        .request-type,
        .date {
          color: #191919ff;
          font-weight: 400;
        }

        .status {
          font-size: 0.75rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 9999px;
          font-weight: 500;
          font-size: 0.75rem;
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
          gap: 0.5rem;
        }

        .btn-approve,
        .btn-reject {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 70px;
        }

        .btn-approve {
          background-color: #228B22;
          color: white;
        }

        .btn-approve:hover:not(:disabled) {
          background-color: #1f7a1f;
        }

        .btn-reject {
          background-color: #DC2626;
          color: white;
        }

        .btn-reject:hover:not(:disabled) {
          background-color: #b91c1c;
        }

        .btn-approve:disabled,
        .btn-reject:disabled {
          background-color: #e4e3e2ff;
          color: #928d8dff;
          cursor: not-allowed;
        }

        .no-data {
          text-align: center;
          color: #191919ff;
          font-style: italic;
        }

        .results-count {
          text-align: center;
          padding: 1rem;
          color: #191919ff;
          font-size: 0.875rem;
          border-top: 1px solid #e2d6cf;
          font-weight: 400;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border: 2px solid #8d6e63;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CheckInOutManagement;