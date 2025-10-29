import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const url = error.config?.url || '';
      
      // Don't show toast errors for course detail endpoints (we handle fallback)
      const isCourseDetail = url.includes('/courses/') && !url.includes('/enroll') && !url.includes('/unenroll');
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          if (!isCourseDetail) {
            toast.error('Access denied. You do not have permission to perform this action.');
          }
          break;
        case 404:
          if (!isCourseDetail) {
            toast.error('Resource not found.');
          }
          break;
        case 422:
          // Validation errors - skip for course detail (we use fallback)
          if (!isCourseDetail) {
            if (data.errors && Array.isArray(data.errors)) {
              data.errors.forEach(err => {
                toast.error(err.msg || err.message);
              });
            } else {
              toast.error(data.message || 'Validation failed.');
            }
          }
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data.message || 'An error occurred.');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyEmail: () => api.post('/auth/verify-email'),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/auth/register', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUsersByRole: (role, params) => api.get(`/users/role/${role}`, { params }),
  getChildren: (parentId) => api.get(`/users/parent/${parentId}/children`),
  toggleUserStatus: (id) => api.post(`/users/${id}/toggle-status`),
  getUserStats: () => api.get('/users/stats/overview'),
  uploadAvatar: (id, data) => api.post(`/users/${id}/avatar`, data),
};

// Courses API
export const coursesAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollInCourse: (id) => api.post(`/courses/${id}/enroll`),
  dropCourse: (id) => api.post(`/courses/${id}/drop`),
  getMyCourses: () => api.get('/courses/my/enrolled'),
  getCourseCategories: () => api.get('/courses/categories'),
  getCourseStudents: (id) => api.get(`/courses/${id}/students`),
  getCourseStats: () => api.get('/courses/stats/overview'),
};

// Assignments API
export const assignmentsAPI = {
  getAssignments: (params) => api.get('/assignments', { params }),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  createAssignment: (data) => api.post('/assignments', data),
  updateAssignment: (id, data) => api.put(`/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  submitAssignment: (id, data) => api.post(`/assignments/${id}/submit`, data),
  gradeAssignment: (id, data) => api.post(`/assignments/${id}/grade`, data),
  getSubmissions: (id) => api.get(`/assignments/${id}/submissions`),
  getMySubmissions: () => api.get('/assignments/my/submissions'),
  getAssignmentStats: () => api.get('/assignments/stats/overview'),
};

// Quizzes API
export const quizzesAPI = {
  getQuizzes: (params) => api.get('/quizzes', { params }),
  getQuiz: (id) => api.get(`/quizzes/${id}`),
  createQuiz: (data) => api.post('/quizzes', data),
  updateQuiz: (id, data) => api.put(`/quizzes/${id}`, data),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
  startQuiz: (id) => api.post(`/quizzes/${id}/start`),
  submitAnswer: (id, data) => api.post(`/quizzes/${id}/answer`, data),
  submitQuiz: (id) => api.post(`/quizzes/${id}/submit`),
  getQuizResults: (id) => api.get(`/quizzes/${id}/results`),
  getMyAttempts: () => api.get('/quizzes/my/attempts'),
};

// Gamification API
export const gamificationAPI = {
  getUserStats: (userId) => api.get(`/gamification/user/${userId}/stats`),
  getLeaderboard: (params) => api.get('/gamification/leaderboard', { params }),
  getRewards: () => api.get('/gamification/rewards'),
  redeemReward: (rewardId) => api.post(`/gamification/rewards/${rewardId}/redeem`),
  addXP: (data) => api.post('/gamification/xp/add', data),
  getAchievements: () => api.get('/gamification/achievements'),
  getActivity: () => api.get('/gamification/activity'),
  getGamificationStats: () => api.get('/gamification/stats/overview'),
};

// Messages API
export const messagesAPI = {
  getMessages: (params) => api.get('/messages', { params }),
  getMessage: (id) => api.get(`/messages/${id}`),
  sendMessage: (data) => api.post('/messages', data),
  updateMessage: (id, data) => api.put(`/messages/${id}`, data),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  toggleLike: (id) => api.post(`/messages/${id}/like`),
  getThreads: (params) => api.get('/messages/threads', { params }),
  createThread: (data) => api.post('/messages/threads', data),
  getUnreadCount: () => api.get('/messages/unread/count'),
};

// Announcements API
export const announcementsAPI = {
  getAnnouncements: (params) => api.get('/announcements', { params }),
  getAnnouncement: (id) => api.get(`/announcements/${id}`),
  createAnnouncement: (data) => api.post('/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
  toggleLike: (id) => api.post(`/announcements/${id}/like`),
  addComment: (id, data) => api.post(`/announcements/${id}/comments`, data),
  deleteComment: (id, commentId) => api.delete(`/announcements/${id}/comments/${commentId}`),
  getMyAnnouncements: (params) => api.get('/announcements/my/created', { params }),
  getUnreadCount: () => api.get('/announcements/unread/count'),
};

// Attendance API
export const attendanceAPI = {
  getSessions: (params) => api.get('/attendance/sessions', { params }),
  getSession: (id) => api.get(`/attendance/sessions/${id}`),
  createSession: (data) => api.post('/attendance/sessions', data),
  markAttendance: (id, data) => api.post(`/attendance/sessions/${id}/mark`, data),
  generateQRCode: (id) => api.post(`/attendance/sessions/${id}/qr-code`),
  verifyQRCode: (id, data) => api.post(`/attendance/sessions/${id}/verify-qr`, data),
  getMyRecords: (params) => api.get('/attendance/my/records', { params }),
  getSummary: (params) => api.get('/attendance/summary', { params }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getPerformance: (params) => api.get('/analytics/performance', { params }),
  getEngagement: (params) => api.get('/analytics/engagement', { params }),
  getCourseAnalytics: (courseId, params) => api.get(`/analytics/course/${courseId}`, { params }),
};

// File Upload API
export const uploadAPI = {
  uploadFile: (file, type = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadMultiple: (files, type = 'general') => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('type', type);
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return 'An unexpected error occurred.';
  }
};

export const formatApiError = (error) => {
  if (error.response?.data?.errors) {
    return error.response.data.errors.map(err => err.msg || err.message).join(', ');
  }
  return error.response?.data?.message || 'An error occurred';
};

export default api;
