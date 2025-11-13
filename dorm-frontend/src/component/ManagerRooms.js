import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { managerAPI } from '../service/api';
import { useParams } from 'react-router-dom';
import "../css/ManagerRooms.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleXmark, 
  faMagnifyingGlass,
  faDoorOpen,
  faUserPlus,
  faUserMinus,
  faSort
} from '@fortawesome/free-solid-svg-icons';

const ManagerRooms = () => {
  const { user } = useAuth();
  const { managerId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [studentsToRemove, setStudentsToRemove] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 6;

  useEffect(() => {
    fetchRooms();
  }, [managerId]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getAllRooms(user.id);
      setRooms(response.data);
    } catch (err) {
      setError('Failed to fetch rooms data');
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  const filteredRooms = rooms
    .filter(room => {
      const matchesSearch = room.roomNum.toLowerCase().includes(searchTerm.toLowerCase());
      const isOccupied = room.students && room.students.length > 0;
      
      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'occupied') return matchesSearch && isOccupied;
      if (filterStatus === 'available') return matchesSearch && !isOccupied;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.roomNum.localeCompare(b.roomNum);
      } else {
        return b.roomNum.localeCompare(a.roomNum);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

  const handleAddStudent = async (room) => {
    setSelectedRoom(room);
    setShowAssignModal(true);
    setStudentSearch('');
    setSelectedStudent(null);

    try {
      const response = await managerAPI.getAvailableStudents(user.id);
      setAvailableStudents(response.data);
    } catch (err) {
      console.error('Error fetching available students:', err);
      alert('Failed to load available students');
    }
  };

  const handleRemoveStudent = (room) => {
    setSelectedRoom(room);
    setStudentsToRemove([]);
    setShowRemoveModal(true);
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent) return;
    
    try {
      await managerAPI.assignRoom(user.id, {
        studentId: selectedStudent.id,
        roomNum: selectedRoom.roomNum
      });
      setShowAssignModal(false);
      setSelectedStudent(null);
      fetchRooms();
    } catch (err) {
      console.error('Error assigning student:', err);
      alert('Failed to assign student to room');
    }
  };

  const handleRemoveStudents = async () => {
    if (studentsToRemove.length === 0) return;
    
    try {
      for (const studentId of studentsToRemove) {
        await managerAPI.removeStudentFromRoom(user.id, studentId);
      }
      setShowRemoveModal(false);
      setStudentsToRemove([]);
      fetchRooms();
    } catch (err) {
      console.error('Error removing students:', err);
      alert('Failed to remove students from room');
    }
  };

  const toggleStudentToRemove = (studentId) => {
    if (studentsToRemove.includes(studentId)) {
      setStudentsToRemove(studentsToRemove.filter(id => id !== studentId));
    } else {
      setStudentsToRemove([...studentsToRemove, studentId]);
    }
  };

  const filteredStudents = availableStudents.filter(student => 
    student.id.toString().includes(studentSearch) ||
    student.name.toLowerCase().includes(studentSearch)
  );

  // Card style consistent with Student Room Page
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
      <div className="error-message">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#faf7f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section - Consistent with Student Room Page */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            color: '#000000',
            fontSize: '2.25rem',
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: '-0.033em',
            marginBottom: '0.5rem',
          }}>
            Dormitory Rooms Management
          </h1>
          <p style={{
            color: '#191919ff',
            fontSize: '1rem',
            fontWeight: 400,
          }}>
            Manage room assignments and student allocations
          </p>
        </div>

        {/* Search and Sort Controls */}
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
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={handleSearchChange}
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

          {/* Sort Dropdown */}
          <div style={{
            position: 'relative',
            minWidth: '192px'
          }}>
            <select
              value={sortOrder}
              onChange={handleSortChange}
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
              <option value="asc">Room Number (Ascending)</option>
              <option value="desc">Room Number (Descending)</option>
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

        {/* Rooms Table - Styled consistently */}
        <div style={cardStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2d6cf' }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#000000',
                }}>
                  Room Number
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#000000',
                }}>
                  Student ID
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#000000',
                }}>
                  Capacity
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#000000',
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRooms.map((room) => {
                const isOccupied = room.students && room.students.length > 0;
                return (
                  <tr key={room.roomNum} style={{ borderBottom: '1px solid #e2d6cf' }}>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: '#000000',
                      fontWeight: 700,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FontAwesomeIcon icon={faDoorOpen} style={{ color: '#CD853F' }} />
                        {room.roomNum}
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: '#191919ff',
                    }}>
                      {isOccupied 
                        ? room.students.map((student, index) => (
                            <React.Fragment key={student.id}>
                              {student.id}
                              {index < room.students.length - 1 && <br />}
                            </React.Fragment>
                          ))
                        : '-'}
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: '#191919ff',
                    }}>
                      {room.occupancy || 0} / {room.capacity || 2}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: room.occupancy >= 2 ? '#e4e3e2ff' : '#228B22',
                            color: room.occupancy >= 2 ? '#928d8dff' : '#ffffff',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: room.occupancy >= 4 ? 'not-allowed' : 'pointer',
                          }}
                          onClick={() => handleAddStudent(room)}
                          disabled={room.occupancy >= 2}
                        >
                          <FontAwesomeIcon icon={faUserPlus} />
                          Add Student
                        </button>
                        <button 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: !room.students || room.students.length === 0 ? '#e4e3e2ff' : '#dc2626',
                            color: room.occupancy <=0 ? '#928d8dff' : '#ffffff',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: !room.students || room.students.length === 0 ? 'not-allowed' : 'pointer',
                          }}
                          onClick={() => handleRemoveStudent(room)}
                          disabled={!room.students || room.students.length === 0}
                        >
                          <FontAwesomeIcon icon={faUserMinus} />
                          Remove Student
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination - Same as announcements page */}
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

      {/* Rest of the modals remain unchanged */}
      {/* Assign Student Modal */}
      {showAssignModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem',
        }}>
          {/* ... existing modal content ... */}
        </div>
      )}

      {/* Remove Student Modal */}
      {showRemoveModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem',
        }}>
          {/* ... existing modal content ... */}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ManagerRooms;