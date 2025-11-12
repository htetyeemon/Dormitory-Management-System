import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Student APIs
export const studentAPI = {
  getDashboard: (studentId) => api.get(`/student/${studentId}/dashboard`),
  getRoomInfo: (studentId) => api.get(`/student/${studentId}/room`),
  createServiceRequest: (studentId, requestData) => 
    api.post(`/student/${studentId}/service/request`, requestData),
  getServiceHistory: (studentId) => 
    api.get(`/student/${studentId}/service/history`),
  submitCheckInOut: (studentId, requestData) => 
    api.post(`/student/${studentId}/checkinout`, requestData),
  getCheckInOutHistory: (studentId) => 
    api.get(`/student/${studentId}/checkinout/history`),
  getAllAnnouncements: () => api.get('/student/announcements'),
};

// Manager APIs
export const managerAPI = {
  getDashboard: (managerId) => api.get(`/manager/${managerId}/dashboard`),
  getAllRooms: (managerId) => api.get(`/manager/${managerId}/rooms`),
  assignRoom: (managerId, assignmentData) => 
    api.post(`/manager/${managerId}/rooms/assign`, assignmentData),
  getAvailableStudents: (managerId) => 
    api.get(`/manager/${managerId}/students/available`),
  reassignRoom: (managerId, reassignmentData) => 
    api.put(`/manager/${managerId}/rooms/reassign`, reassignmentData),
  removeStudentFromRoom: (managerId, studentId) => 
    api.delete(`/manager/${managerId}/rooms/remove-student/${studentId}`),
  searchRooms: (managerId, searchTerm) => 
    api.get(`/manager/${managerId}/rooms/search?searchTerm=${searchTerm}`),
  getAllCheckInOutRequests: (managerId) => 
    api.get(`/manager/${managerId}/checkinout`),
  getPendingCheckInOutRequests: (managerId) => 
    api.get(`/manager/${managerId}/checkinout/pending`),
  approveCheckInOutRequest: (managerId, requestId) => 
    api.post(`/manager/${managerId}/checkinout/${requestId}/approve`),
  rejectCheckInOutRequest: (managerId, requestId) => 
    api.post(`/manager/${managerId}/checkinout/${requestId}/reject`),
  getAllComplaints: (managerId) => 
    api.get(`/manager/${managerId}/complaints`),
  getPendingComplaints: (managerId) => 
    api.get(`/manager/${managerId}/complaints/pending`),
  updateComplaintStatus: (managerId, complaintId,status) => 
    api.put(`/manager/${managerId}/complaints/${complaintId}/${status}`),
  getAllAnnouncements: (managerId) => 
    api.get(`/manager/${managerId}/announcements`),
  searchAnnouncements: (managerId, keyword) => 
    api.get(`/manager/${managerId}/announcements/search?keyword=${keyword}`),
  createAnnouncement: (managerId, announcementData) => 
    api.post(`/manager/${managerId}/announcements`, announcementData),
  updateAnnouncement: (managerId, announcementId, announcementData) => 
    api.put(`/manager/${managerId}/announcements/${announcementId}`, announcementData),
  deleteAnnouncement: (managerId, announcementId) => 
    api.delete(`/manager/${managerId}/announcements/${announcementId}`),
};

// Auth API
export const authAPI = {
  login: (id, password, userType) => 
    api.post('/auth/login', { id, password, userType }),
};

export default api;