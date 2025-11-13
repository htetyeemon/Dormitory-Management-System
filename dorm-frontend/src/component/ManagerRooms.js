import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { managerAPI } from '../service/api';
import { useParams } from 'react-router-dom';
import "../css/ManagerRooms.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCircleXmark, faMagnifyingGlass
    
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
    <div className="manager-rooms-container">
      <div className="manager-header">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="header-title">
            Dormitory Rooms
          </h1>
          <p style={{
            color: '#191919ff',
            fontSize: '1rem',
            fontWeight: 400,
          }}>
            Manage room assignments and student allocations
          </p>
        </div>

        {/* Search Bar - Full width */}
        <div className="search-container-full">
          <div className="search-wrapper-full">
            
            <input 
              className="search-input-full"
              placeholder="Search for a room..."
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
            <tbody className="table-body">
              {filteredRooms.map((room) => {
                const isOccupied = room.students && room.students.length > 0;
                return (
                  <tr key={room.roomNum} className="table-row">
                    <td className="table-cell table-cell-primary">
                      {room.roomNum}
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
      </div>

      {/* Assign Student Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Modal Header */}
            <div className="modal-header">
              <div className="flex flex-col gap-1">
                <h2 className="modal-title">
                  Assign Student to Room {selectedRoom?.roomNum}
                </h2>
                <p className="modal-subtitle">
                  Fill in the details below to assign a student to this room.
                </p>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowAssignModal(false)}
              >
                <span className="material-symbols-outlined text-2xl"><FontAwesomeIcon icon={faCircleXmark} /></span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Room Number (Read-only) */}
              <label className="form-label">
                <p className="label-text">
                  Room Number
                </p>
                <input 
                  className="form-input form-input-readonly"
                  readOnly 
                  value={selectedRoom?.roomNum}
                />
              </label>

              {/* Student ID (Search) */}
              <label className="form-label">
                <p className="label-text">
                  Student ID
                </p>
                <div className="search-input-wrapper">
                  <input 
                    className="form-input form-input-search"
                    placeholder="Type to search by Student ID or Name"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                  <div className="search-input-icon">
                    <span className="material-symbols-outlined text-2xl"><FontAwesomeIcon icon={faMagnifyingGlass} /></span>
                  </div>
                </div>
                <p className="helper-text">
                  Search by student's name or ID number to select.
                </p>
              </label>

              {/* Student List */}
              {studentSearch && (
                <div className="student-list">
                  {filteredStudents.map(student => (
                    <div 
                      key={student.id}
                      className={`student-item ${selectedStudent?.id === student.id ? 'student-item-selected' : ''}`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="student-id">
                        {student.id}
                      </div>
                      <div className="student-name">
                        {student.name}
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="empty-state">No students found</div>
                  )}
                </div>
              )}

              {/* Student Name (Auto-populated) */}
              {selectedStudent && (
                <label className="form-label">
                  <p className="label-text">
                    Student Name
                  </p>
                  <input 
                    className="form-input form-input-readonly"
                    readOnly 
                    value={selectedStudent.name}
                  />
                </label>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button 
                className="footer-btn btn-secondary"
                onClick={() => setShowAssignModal(false)}
              >
                <span className="truncate">Back</span>
              </button>
              <button 
                className={`footer-btn btn-primary ${!selectedStudent ? 'disabled' : ''}`}
                onClick={handleAssignStudent}
                disabled={!selectedStudent}
              >
                <span className="truncate">Assign Student</span>
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

      {/* Remove Student Modal - Styled consistently */}
      {showRemoveModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Modal Header */}
            <div className="modal-header">
              <div className="flex flex-col gap-1">
                <h2 className="modal-title">
                  Remove Students from Room {selectedRoom?.roomNum}
                </h2>
                <p className="modal-subtitle">
                  Select students to remove from this room.
                </p>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowRemoveModal(false)}
              >
                <span className="material-symbols-outlined text-2xl"><FontAwesomeIcon icon={faCircleXmark} /></span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Student List with Checkboxes */}
              <div className="student-list">
                {selectedRoom?.students && selectedRoom.students.length > 0 ? (
                  selectedRoom.students.map(student => (
                    <div key={student.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={studentsToRemove.includes(student.id)}
                        onChange={() => toggleStudentToRemove(student.id)}
                        className="checkbox-input"
                      />
                      <label htmlFor={`student-${student.id}`} className="checkbox-label">
                        {student.id} - {student.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">
                    No students in this room.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button 
                className="footer-btn btn-secondary"
                onClick={() => setShowRemoveModal(false)}
              >
                <span className="truncate">Cancel</span>
              </button>
              <button 
                className={`footer-btn btn-danger ${studentsToRemove.length === 0 ? 'disabled' : ''}`}
                onClick={handleRemoveStudents}
                disabled={studentsToRemove.length === 0}
              >
                <span className="truncate">Remove Selected</span>
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