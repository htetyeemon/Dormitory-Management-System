import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { managerAPI } from '../service/api';
import { useParams } from 'react-router-dom';
import '../css/ManagerAnnouncements.css'

const ManagerAnnouncements = () => {
  const { user } = useAuth();
  const { managerId } = useParams();
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
    // Check for dark mode preference
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, [managerId]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getAllAnnouncements(managerId || user.id);
      setAnnouncements(response.data);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (announcement, e) => {
    e.stopPropagation(); // Prevent triggering the row click
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description
    });
    setShowModal(true);
  };

  const handleView = (announcement) => {
    setViewingAnnouncement(announcement);
    setShowViewModal(true);
  };

  const handleDelete = (announcement, e) => {
    e.stopPropagation(); // Prevent triggering the row click
    setDeleteConfirm(announcement);
  };

  const confirmDelete = async () => {
    try {
      await managerAPI.deleteAnnouncement(
        managerId || user.id, 
        deleteConfirm.id
      );
      setAnnouncements(announcements.filter(a => a.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      
      // Adjust current page if needed after deletion
      const filtered = announcements.filter(a => a.id !== deleteConfirm.id);
      const filteredAfterSearch = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const totalPagesAfterDelete = Math.ceil(filteredAfterSearch.length / itemsPerPage);
      if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
        setCurrentPage(totalPagesAfterDelete);
      }
    } catch (err) {
      setError('Failed to delete announcement');
      console.error('Error deleting announcement:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        // Update existing announcement
        const response = await managerAPI.updateAnnouncement(
          managerId || user.id,
          editingAnnouncement.id,
          {
            ...formData,
            dateTime: new Date().toISOString()
          }
        );
        setAnnouncements(announcements.map(a => 
          a.id === editingAnnouncement.id ? response.data : a
        ));
      } else {
        // Create new announcement
        const response = await managerAPI.createAnnouncement(
          managerId || user.id,
          {
            ...formData,
            dateTime: new Date().toISOString()
          }
        );
        setAnnouncements([response.data, ...announcements]);
      }
      setShowModal(false);
      setFormData({ title: '', description: '' });
    } catch (err) {
      setError(`Failed to ${editingAnnouncement ? 'update' : 'create'} announcement`);
      console.error('Error saving announcement:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter announcements based on search term
  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAnnouncements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date and time for detailed view
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className={`announcements-container ${isDarkMode ? 'dark' : ''}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`announcements-container ${isDarkMode ? 'dark' : ''}`}>
        <div className="error-container">
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`announcements-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Section */}
        <div className="announcements-header">
          <div>
            <h1 className="announcements-title">Announcements Management</h1>
            <p className="announcements-subtitle">
              Create, edit, and delete announcements for residents.
            </p>
          </div>
          <button 
            onClick={handleCreate}
            className="create-btn"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Create Announcement</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-wrapper">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              className="search-input"
              placeholder="Search by announcement title..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Announcements List */}
        <div className="announcements-list">
          {currentItems.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? 'No announcements match your search.' : 'No announcements found.'}
            </div>
          ) : (
            <div>
              {currentItems.map((announcement) => (
                <div 
                  key={announcement.id} 
                  className="announcement-item"
                  onClick={() => handleView(announcement)}
                >
                  <div className="announcement-content">
                    <div className="announcement-icon">
                      <span className="material-symbols-outlined">campaign</span>
                    </div>
                    <div className="announcement-text">
                      <h3 className="announcement-title">
                        {announcement.title}
                      </h3>
                      <p className="announcement-date">
                        Date Posted: {formatDate(announcement.dateTime)}
                      </p>
                    </div>
                  </div>
                  <div className="announcement-actions">
                    <button 
                      onClick={(e) => handleEdit(announcement, e)}
                      className="action-btn edit-btn"
                      title="Edit announcement"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                      onClick={(e) => handleDelete(announcement, e)}
                      className="action-btn delete-btn"
                      title="Delete announcement"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAnnouncements.length)} of {filteredAnnouncements.length} announcements
            </div>
            <div className="pagination">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Create/Edit Announcement Modal */}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h2 className="modal-title">
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="title">
                    Title
                  </label>
                  <input
                    className="form-input"
                    id="title"
                    name="title"
                    placeholder="e.g. End of Semester Party"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    className="form-textarea"
                    id="description"
                    name="description"
                    placeholder="Enter the full details of the announcement here..."
                    rows="5"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="secondary-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    {editingAnnouncement ? 'Update Announcement' : 'Save Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Announcement Modal */}
        {showViewModal && viewingAnnouncement && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h2 className="modal-title">{viewingAnnouncement.title}</h2>
              
              <div className="announcement-meta">
                <div className="meta-item">
                  <span className="material-symbols-outlined meta-icon">calendar_today</span>
                  <span className="meta-text">
                    Posted on: {formatDateTime(viewingAnnouncement.dateTime)}
                  </span>
                </div>
              </div>

              <div className="announcement-description">
                <h3 className="description-title">Description</h3>
                <div className="description-content">
                  {viewingAnnouncement.description}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="secondary-btn"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingAnnouncement, { stopPropagation: () => {} });
                  }}
                  className="primary-btn"
                >
                  Edit Announcement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="modal-backdrop">
            <div className="delete-modal-content">
              <h2 className="delete-title">Delete Announcement</h2>
              <p className="delete-message">
                Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="secondary-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="danger-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerAnnouncements;