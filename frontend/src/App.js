import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Helmet } from 'react-helmet';

// Layout Components
import Layout from './components/Layout/Layout';
import AuthLayout from './components/Layout/AuthLayout';

// Auth Components
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Dashboard Components
import Dashboard from './pages/Dashboard/Dashboard';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import TeacherDashboard from './pages/Dashboard/TeacherDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';

// Course Components
import Courses from './pages/Courses/Courses';
import CourseDetail from './pages/Courses/CourseDetail';
import MyCourses from './pages/Courses/MyCourses';

// Assignment Components
import Assignments from './pages/Assignments/Assignments';
import AssignmentDetail from './pages/Assignments/AssignmentDetail';
import CreateAssignment from './pages/Assignments/CreateAssignment';

// Quiz Components
import Quizzes from './pages/Quizzes/Quizzes';
import QuizDetail from './pages/Quizzes/QuizDetail';
import TakeQuiz from './pages/Quizzes/TakeQuiz';
import CreateQuiz from './pages/Quizzes/CreateQuiz';

// Gamification Components
import Leaderboard from './pages/Gamification/Leaderboard';
import Rewards from './pages/Gamification/Rewards';

// Communication Components
import Messages from './pages/Communication/Messages';
import Announcements from './pages/Communication/Announcements';


// Profile Components
import Profile from './pages/Profile/Profile';
import Settings from './pages/Profile/Settings';

// Admin pages (new)
import Students from './pages/Admin/Students';
import Teachers from './pages/Admin/Teachers';
import CourseProgress from './pages/Admin/CourseProgress';
import AttendanceGrades from './pages/Admin/AttendanceGrades';
import AnnouncementsMessages from './pages/Admin/AnnouncementsMessages';

// Loading Component
import { PageLoader } from './components/UI';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Router>
      <Helmet>
        <title>student teacher portal</title>
        <meta name="description" content="Next-generation educational platform with gamification and modern learning tools" />
      </Helmet>
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <AuthLayout>
              <Register />
            </AuthLayout>
          </PublicRoute>
        } />
        
        <Route path="/forgot-password" element={
          <PublicRoute>
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          </PublicRoute>
        } />

        {/* Protected Routes - All wrapped in Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Dashboard Routes */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teacher-dashboard" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Course Routes */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/my-courses" element={<MyCourses />} />

          {/* Assignment Routes */}
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/assignments/:id" element={<AssignmentDetail />} />
          <Route path="/assignments/create" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <CreateAssignment />
            </ProtectedRoute>
          } />

          {/* Quiz Routes */}
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/quizzes/:id" element={<QuizDetail />} />
          <Route path="/quizzes/:id/take" element={
            <ProtectedRoute allowedRoles={['student']}>
              <TakeQuiz />
            </ProtectedRoute>
          } />
          <Route path="/quizzes/create" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <CreateQuiz />
            </ProtectedRoute>
          } />

          {/* Gamification Routes */}
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/rewards" element={<Rewards />} />

          {/* Communication Routes */}
          <Route path="/messages" element={<Messages />} />
          <Route path="/announcements" element={<Announcements />} />

          {/* Attendance (Teacher/Student) */}
          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['teacher','student']}>
              <AttendanceGrades />
            </ProtectedRoute>
          } />

          {/* Profile Routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin management routes (admin only) */}
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Students />
            </ProtectedRoute>
          } />
          <Route path="/admin/teachers" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Teachers />
            </ProtectedRoute>
          } />
          <Route path="/admin/course-progress" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CourseProgress />
            </ProtectedRoute>
          } />
          <Route path="/admin/attendance-grades" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AttendanceGrades />
            </ProtectedRoute>
          } />
          <Route path="/admin/announcements-messages" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AnnouncementsMessages />
            </ProtectedRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                <Navigate to="/dashboard" replace />
              </div>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
