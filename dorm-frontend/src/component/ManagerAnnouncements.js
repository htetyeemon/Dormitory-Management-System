import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { managerAPI } from '../service/api';
import { useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faSquarePlus, faSearch, faCalendarDays, faSort, faTimes } from '@fortawesome/free-solid-svg-icons';

const ManagerAnnouncements = () => {
  const { user } = useAuth();
  const { managerId } = useParams();
  const location = useLocation();
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
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
  const [expandedAnnouncements, setExpandedAnnouncements] = useState(new Set());
  const [expandedViewModal, setExpandedViewModal] = useState(false);
  const announcementsPerPage = 6;

  useEffect(() => {
    fetchAnnouncements();
    
    // Check if we should open the create modal automatically
    if (location.state?.openCreateModal) {
      handleCreate();
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [managerId, location.state]);

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
    e.stopPropagation();
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description
    });
    setShowModal(true);
  };

  const handleView = (announcement) => {
    setViewingAnnouncement(announcement);
    setExpandedViewModal(false);
    setShowViewModal(true);
  };

  const handleDelete = (announcement, e) => {
    e.stopPropagation();
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
    } catch (err) {
      setError('Failed to delete announcement');
      console.error('Error deleting announcement:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  const toggleReadMore = (announcementId) => {
    const newExpanded = new Set(expandedAnnouncements);
    if (newExpanded.has(announcementId)) {
      newExpanded.delete(announcementId);
    } else {
      newExpanded.add(announcementId);
    }
    setExpandedAnnouncements(newExpanded);
  };

  const toggleViewModalReadMore = () => {
    setExpandedViewModal(!expandedViewModal);
  };

  // Filter and sort announcements
  const filteredAnnouncements = announcements
    .filter(announcement =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.dateTime);
      const dateB = new Date(b.dateTime);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Pagination
  const totalPages = Math.ceil(filteredAnnouncements.length / announcementsPerPage);
  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = filteredAnnouncements.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const needsReadMore = (description) => {
    return description.length > 200;
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

  // Card style matching student page
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e8c8b5ff',
    padding: '1.5rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  };

  // Modal styles
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

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: '#faf7f5',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={cardStyle}>
          <div style={{ color: '#d0021b', fontSize: '1rem' }}>{error}</div>
        </div>
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
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h1 style={{
                color: '#000000',
                fontSize: '2.25rem',
                fontWeight: 600,
                lineHeight: 1.25,
                letterSpacing: '-0.033em',
                marginBottom: '0.5rem',
              }}>
                Announcements Management
              </h1>
              <p style={{
                color: '#191919ff',
                fontSize: '1rem',
                fontWeight: 400,
                lineHeight: 'normal',
              }}>
                Create, edit, and delete announcements for residents.
              </p>
            </div>
            
            {/* Create Button - Maintaining original style */}
            <button 
              onClick={handleCreate}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                backgroundColor: 'rgb(34, 139, 34)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'linear-gradient(135deg, rgb(34, 139, 34), rgb(34, 139, 34))';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px 0 rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgb(34, 139, 34)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
              }}
            >
              <FontAwesomeIcon icon={faSquarePlus} />
              <span>Create Announcement</span>
            </button>
          </div>
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
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              placeholder="Search announcements..."
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
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
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

        {/* Announcements List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {currentAnnouncements.length > 0 ? (
            currentAnnouncements.map((announcement) => {
              const isExpanded = expandedAnnouncements.has(announcement.id);
              const shouldShowReadMore = needsReadMore(announcement.description);

              return (
                <div
                  key={announcement.id}
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
                  onClick={() => handleView(announcement)}
                >
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: '#CD853F', fontSize: '1.25rem' }}>
                        <FontAwesomeIcon icon={faBullhorn} />
                      </span>
                      <h3 style={{
                        color: '#000000',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        margin: 0,
                      }}>
                        {announcement.title}
                      </h3>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem'
                    }}>
                      
                      {/* Action Buttons - Maintaining original styles */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        flexShrink: 0,
                        paddingRight:'2rem'
                      }}>
                        <button 
                          onClick={(e) => handleEdit(announcement, e)}
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
                            e.target.style.background = '#1C711C';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px 0 rgba(59, 130, 246, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#228B22';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 1px 2px 0 rgba(59, 130, 246, 0.2)';
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => handleDelete(announcement, e)}
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
                            e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px 0 rgba(239, 68, 68, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#d8392eff';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 1px 2px 0 rgba(59, 130, 246, 0.2)';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    color: '#191919ff',
                    fontSize: '1rem',
                    lineHeight: 1.5,
                    margin: 0,
                  }}>
                    <div
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'unset' : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}
                    >
                      {announcement.description}
                    </div>
                    {shouldShowReadMore && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReadMore(announcement.id);
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
                        {isExpanded ? 'Read Less ↑' : 'Read More ↓'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{
              ...cardStyle,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '3rem',
              color: '#191919ff',
              fontSize: '1rem',
            }}>
              {searchTerm ? 'No announcements found matching your search.' : 'No announcements available.'}
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

        {/* Create/Edit Announcement Modal */}
        {showModal && (
          <div style={modalBackdropStyle}>
            <div style={{
              ...modalContentStyle,
              maxWidth: '600px'
            }}>
              <div style={modalHeaderStyle}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1f2937',
                  margin: 0,
                }}>
                  {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
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
                <form style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                }} onSubmit={handleSubmit}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#374151',
                    }} htmlFor="title">
                      Title
                    </label>
                    <input
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        backgroundColor: 'white',
                        transition: 'all 0.2s ease',
                        width: '100%',
                      }}
                      id="title"
                      name="title"
                      placeholder="e.g. End of Semester Party"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#4a90e2';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#374151',
                    }} htmlFor="description">
                      Description
                    </label>
                    <textarea
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        backgroundColor: 'white',
                        transition: 'all 0.2s ease',
                        resize: 'vertical',
                        minHeight: '150px',
                        width: '100%',
                        fontFamily: 'inherit',
                        lineHeight: 1.5,
                      }}
                      id="description"
                      name="description"
                      placeholder="Enter the full details of the announcement here..."
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#4a90e2';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </form>
              </div>
              <div style={modalFooterStyle}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    backgroundColor: '#9b140bff',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b14841ff'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#9b140bff'}
                >
                  {editingAnnouncement ? 'Update Announcement' : 'Save Announcement'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Announcement Modal */}
        {showViewModal && viewingAnnouncement && (
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
                  {viewingAnnouncement.title}
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
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}>
                    <span style={{
                      fontSize: '1.125rem',
                      color: '#CD853F',
                    }}>
                      <FontAwesomeIcon icon={faCalendarDays} />
                    </span>
                    <span style={{
                      fontSize: '1rem',
                      color: '#374151',
                      fontWeight: 500,
                    
                    }}>
                      Posted on: {formatDateTime(viewingAnnouncement.dateTime)}
                    </span>
                  </div>
                </div>

                <div style={{
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '1rem',
                  }}>
                    Description
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
                      }}
                    >
                      {viewingAnnouncement.description}
                    </div>
                    {needsReadMore(viewingAnnouncement.description) && (
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
                            <span>↑</span>
                          </>
                        ) : (
                          <>
                            <span>Read More</span>
                            <span>↓</span>
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
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingAnnouncement, { stopPropagation: () => {} });
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    backgroundColor: '#9b140bff',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b14841ff'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#9b140bff'}
                >
                  Edit Announcement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div style={modalBackdropStyle}>
            <div style={{
              ...modalContentStyle,
              maxWidth: '500px'
            }}>
              <div style={modalHeaderStyle}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1f2937',
                  margin: 0,
                }}>
                  Delete Announcement
                </h2>
                <button
                  onClick={() => setDeleteConfirm(null)}
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
                <p style={{
                  color: '#6b7280',
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  Are you sure you want to delete "<strong>{deleteConfirm.title}</strong>"? 
                  This action cannot be undone.
                </p>
              </div>
              <div style={modalFooterStyle}>
                <button
                  onClick={() => setDeleteConfirm(null)}
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
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    backgroundColor: '#d0021b',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b80218'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#d0021b'}
                >
                  Delete
                </button>
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
      `}</style>
    </div>
  );
};

export default ManagerAnnouncements;