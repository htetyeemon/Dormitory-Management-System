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
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNum.toLowerCase().includes(searchTerm.toLowerCase());
    const isOccupied = room.students && room.students.length > 0;
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'occupied') return matchesSearch && isOccupied;
    if (filterStatus === 'available') return matchesSearch && !isOccupied;
    
    return matchesSearch;
  });

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

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
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
        </div>

        {/* Search Bar - Full width */}
        <div className="search-container-full">
          <div className="search-wrapper-full">
            
            <input 
              className="search-input-full"
              placeholder="Search for a room..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Rooms Table */}
        <div className="table-container">
          <table className="rooms-table">
            <thead>
              <tr className="table-header">
                <th className="table-header-cell">
                  Room Number
                </th>
                <th className="table-header-cell">
                  Student ID
                </th>
                <th className="table-header-cell">
                  Capacity
                </th>
                <th className="table-header-cell">
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
                    <td className="table-cell table-cell-secondary">
                      {isOccupied 
                        ? room.students.map((student, index) => (
                            <React.Fragment key={student.id}>
                              {student.id}
                              {index < room.students.length - 1 && <br />}
                            </React.Fragment>
                          ))
                        : '-'}
                    </td>
                    <td className="table-cell table-cell-secondary">
                      {room.occupancy || 0} / {room.capacity || 4}
                    </td>
                    <td className="table-cell">
                      <div className="action-buttons-left">
                        <button 
                          className={`add-student-btn ${room.occupancy >= 4 ? 'disabled' : ''}`}
                          onClick={() => handleAddStudent(room)}
                          disabled={room.occupancy >= 4}
                        >
                          Add Student
                        </button>
                        <button 
                          className="remove-student-btn"
                          onClick={() => handleRemoveStudent(room)}
                          disabled={!room.students || room.students.length === 0}
                        >
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
            </div>
          </div>
        </div>
      )}

      {/* Remove Student Modal */}
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
    </div>
  );
};

export default ManagerRooms;
