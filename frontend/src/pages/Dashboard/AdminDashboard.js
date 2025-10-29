import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard, FeatureCard } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalAssignments: 0,
    totalQuizzes: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      setTimeout(() => {
        setStats({
          totalUsers: 156,
          totalCourses: 12,
          totalAssignments: 45,
          totalQuizzes: 28,
        });

        setRecentUsers([
          {
            id: 1,
            name: 'Alex Smith',
            email: 'alex.smith@demo.com',
            role: 'student',
            joinedAt: '2024-01-15',
            status: 'active',
          },
          {
            id: 2,
            name: 'Emma Wilson',
            email: 'emma.wilson@demo.com',
            role: 'student',
            joinedAt: '2024-01-14',
            status: 'active',
          },
        ]);

        setLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-success-500 via-success-600 to-success-700 rounded-2xl p-8 text-white shadow-2xl border border-success-400/20 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
                <span>Welcome back, {user?.firstName}!</span>
                <span className="animate-bounce">👨‍💼</span>
              </h1>
              <p className="text-green-100 text-lg">
                Manage your educational platform and ensure smooth operations for all users.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-right border border-white/20">
                <div className="text-3xl font-bold">{stats.totalUsers} Users</div>
                <div className="text-green-100 flex items-center justify-end space-x-1">
                  <AcademicCapIcon className="h-5 w-5" />
                  <span>{stats.totalCourses} Courses</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="transform transition-all hover:scale-105 hover:shadow-xl">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<UserGroupIcon className="h-8 w-8" />}
            change="+12 this month"
            changeType="positive"
          />
        </div>
        <div className="transform transition-all hover:scale-105 hover:shadow-xl">
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<AcademicCapIcon className="h-8 w-8" />}
            change="+2 this month"
            changeType="positive"
          />
        </div>
        <div className="transform transition-all hover:scale-105 hover:shadow-xl">
          <StatCard
            title="Total Assignments"
            value={stats.totalAssignments}
            icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
            change="+8 this month"
            changeType="positive"
          />
        </div>
        <div className="transform transition-all hover:scale-105 hover:shadow-xl">
          <StatCard
            title="Total Quizzes"
            value={stats.totalQuizzes}
            icon={<QuestionMarkCircleIcon className="h-8 w-8" />}
            change="+5 this month"
            changeType="positive"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-2">
          <div className="card shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-header bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  <span>Recent Users</span>
                </h2>
                <Link to="/users">
                  <Button variant="outline" size="sm" className="hover:bg-blue-50">View All</Button>
                </Link>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-all hover:border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-sm font-bold text-white">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                            Joined: {user.joinedAt}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                            user.role === 'student' ? 'bg-blue-100 text-blue-700' : 
                            user.role === 'teacher' ? 'bg-purple-100 text-purple-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="card shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-header bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Cog6ToothIcon className="h-6 w-6 text-green-600" />
                <span>Quick Actions</span>
              </h2>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <Link to="/admin/students">
                  <Button variant="primary" fullWidth className="justify-start hover:shadow-md transition-all">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    Student Management
                  </Button>
                </Link>
                <Link to="/admin/teachers">
                  <Button variant="outline" fullWidth className="justify-start hover:bg-purple-50 hover:border-purple-300 transition-all">
                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                    Teacher Management
                  </Button>
                </Link>
                <Link to="/admin/course-progress">
                  <Button variant="outline" fullWidth className="justify-start hover:bg-blue-50 hover:border-blue-300 transition-all">
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Track Course Progress
                  </Button>
                </Link>
                <Link to="/admin/attendance-grades">
                  <Button variant="outline" fullWidth className="justify-start hover:bg-orange-50 hover:border-orange-300 transition-all">
                    <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                    Attendance & Grades
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tools Grid */}
      <div className="card shadow-lg hover:shadow-xl transition-shadow">
        <div className="card-header bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <ShieldCheckIcon className="h-6 w-6 text-indigo-600" />
            <span>Administrative Tools</span>
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/students" className="transform transition-all hover:scale-105">
              <FeatureCard
                title="User Management"
                description="Manage users, roles, and permissions"
                icon={<UserGroupIcon className="h-8 w-8" />}
              />
            </Link>
            <Link to="/analytics" className="transform transition-all hover:scale-105">
              <FeatureCard
                title="System Analytics"
                description="Monitor platform performance and usage"
                icon={<ChartBarIcon className="h-8 w-8" />}
              />
            </Link>
            <Link to="/settings" className="transform transition-all hover:scale-105">
              <FeatureCard
                title="Security Settings"
                description="Configure security and access controls"
                icon={<ShieldCheckIcon className="h-8 w-8" />}
              />
            </Link>
            <Link to="/settings" className="transform transition-all hover:scale-105">
              <FeatureCard
                title="System Configuration"
                description="Manage system settings and preferences"
                icon={<Cog6ToothIcon className="h-8 w-8" />}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
