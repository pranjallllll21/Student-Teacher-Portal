import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Render role-specific dashboard
  switch (user?.role) {
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to student teacher portal
            </h1>
            <p className="text-gray-600">
              Please contact your administrator to set up your account.
            </p>
          </div>
        </div>
      );
  }
};

export default Dashboard;
