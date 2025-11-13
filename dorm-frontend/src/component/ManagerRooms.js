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
    student.name.toLowerCase().includes(studentSearch.toLowerCase())
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
            fontWeight: 900,
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
              <option value="asc">Room Number (A-Z)</option>
              <option value="desc">Room Number (Z-A)</option>
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
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            border: '1px solid #e8c8b5ff',
            width: '100%',
            maxWidth: '28rem',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '1.5rem 1.5rem 1rem 1.5rem',
              borderBottom: '1px solid #e2d6cf',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <h2 style={{
                  color: '#000000',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: 0,
                }}>
                  Assign Student to Room {selectedRoom?.roomNum}
                </h2>
                <p style={{
                  color: '#191919ff',
                  fontSize: '0.875rem',
                  margin: 0,
                }}>
                  Fill in the details below to assign a student to this room.
                </p>
              </div>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#928d8dff',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
                onClick={() => setShowAssignModal(false)}
              >
                <FontAwesomeIcon icon={faCircleXmark} style={{ fontSize: '1.5rem' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Room Number */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{
                  color: '#000000',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}>
                  Room Number
                </span>
                <input 
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #e2d6cf',
                    borderRadius: '0.375rem',
                    backgroundColor: '#faf7f5',
                    color: '#191919ff',
                    fontSize: '0.875rem',
                  }}
                  readOnly 
                  value={selectedRoom?.roomNum}
                />
              </label>

              {/* Student Search */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{
                  color: '#000000',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}>
                  Student ID
                </span>
                <div style={{ position: 'relative' }}>
                  <input 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      border: '1px solid #e2d6cf',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      backgroundColor: '#ffffff',
                      color: '#191919ff',
                    }}
                    placeholder="Type to search by Student ID or Name"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#CD853F',
                  }}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </span>
                </div>
                <p style={{
                  color: '#928d8dff',
                  fontSize: '0.75rem',
                  margin: 0,
                }}>
                  Search by student's name or ID number to select.
                </p>
              </label>

              {/* Student List */}
              {studentSearch && (
                <div style={{
                  border: '1px solid #e2d6cf',
                  borderRadius: '0.375rem',
                  maxHeight: '12rem',
                  overflow: 'auto',
                }}>
                  {filteredStudents.map(student => (
                    <div 
                      key={student.id}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e2d6cf',
                        backgroundColor: selectedStudent?.id === student.id ? '#f5e8dfff' : 'transparent',
                      }}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div style={{
                        color: '#69301cff',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}>
                        {student.id}
                      </div>
                      <div style={{
                        color: '#191919ff',
                        fontSize: '0.875rem',
                      }}>
                        {student.name}
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div style={{
                      padding: '2rem 1rem',
                      textAlign: 'center',
                      color: '#928d8dff',
                      fontSize: '0.875rem',
                    }}>
                      No students found
                    </div>
                  )}
                </div>
              )}

              {/* Student Name */}
              {selectedStudent && (
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{
                    color: '#000000',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}>
                    Student Name
                  </span>
                  <input 
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #e2d6cf',
                      borderRadius: '0.375rem',
                      backgroundColor: '#faf7f5',
                      color: '#191919ff',
                      fontSize: '0.875rem',
                    }}
                    readOnly 
                    value={selectedStudent.name}
                  />
                </label>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              padding: '1rem 1.5rem 1.5rem 1.5rem',
              borderTop: '1px solid #e2d6cf',
            }}>
              <button 
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #e2d6cf',
                  borderRadius: '0.375rem',
                  backgroundColor: 'transparent',
                  color: '#191919ff',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onClick={() => setShowAssignModal(false)}
              >
                Back
              </button>
              <button 
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: !selectedStudent ? '#e2d6cf' : '#7d2923',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: !selectedStudent ? 'not-allowed' : 'pointer',
                }}
                onClick={handleAssignStudent}
                disabled={!selectedStudent}
              >
                Assign Student
              </button>
            </div>
          </div>
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
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            border: '1px solid #e8c8b5ff',
            width: '100%',
            maxWidth: '28rem',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '1.5rem 1.5rem 1rem 1.5rem',
              borderBottom: '1px solid #e2d6cf',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <h2 style={{
                  color: '#000000',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: 0,
                }}>
                  Remove Students from Room {selectedRoom?.roomNum}
                </h2>
                <p style={{
                  color: '#191919ff',
                  fontSize: '0.875rem',
                  margin: 0,
                }}>
                  Select students to remove from this room.
                </p>
              </div>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#928d8dff',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
                onClick={() => setShowRemoveModal(false)}
              >
                <FontAwesomeIcon icon={faCircleXmark} style={{ fontSize: '1.5rem' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                border: '1px solid #e2d6cf',
                borderRadius: '0.375rem',
                maxHeight: '16rem',
                overflow: 'auto',
              }}>
                {selectedRoom?.students && selectedRoom.students.length > 0 ? (
                  selectedRoom.students.map(student => (
                    <div key={student.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid #e2d6cf',
                    }}>
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={studentsToRemove.includes(student.id)}
                        onChange={() => toggleStudentToRemove(student.id)}
                        style={{
                          width: '1rem',
                          height: '1rem',
                          color: '#CD853F',
                        }}
                      />
                      <label htmlFor={`student-${student.id}`} style={{
                        color: '#191919ff',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        flex: 1,
                      }}>
                        {student.id} - {student.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <div style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: '#928d8dff',
                    fontSize: '0.875rem',
                  }}>
                    No students in this room.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              padding: '1rem 1.5rem 1.5rem 1.5rem',
              borderTop: '1px solid #e2d6cf',
            }}>
              <button 
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #e2d6cf',
                  borderRadius: '0.375rem',
                  backgroundColor: 'transparent',
                  color: '#191919ff',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onClick={() => setShowRemoveModal(false)}
              >
                Cancel
              </button>
              <button 
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: studentsToRemove.length === 0 ? '#e2d6cf' : '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: studentsToRemove.length === 0 ? 'not-allowed' : 'pointer',
                }}
                onClick={handleRemoveStudents}
                disabled={studentsToRemove.length === 0}
              >
                Remove Selected
              </button>
            </div>
          </div>
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